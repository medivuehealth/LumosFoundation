"""Utilities for API rate limiting and caching"""

import time
import json
import hashlib
import logging
from pathlib import Path
from typing import Any, Callable, Dict, Optional
from functools import wraps
from datetime import datetime, timedelta
import aiohttp
import asyncio
from ..config.settings import CACHE_DIR, API_CONFIG

logger = logging.getLogger(__name__)

class RateLimiter:
    """Rate limiter for API calls"""
    
    def __init__(self, calls: int, period: float = 1.0):
        """
        Initialize rate limiter
        
        Args:
            calls: Number of calls allowed per period
            period: Time period in seconds
        """
        self.calls = calls
        self.period = period
        self.timestamps = []
    
    async def acquire(self):
        """Acquire permission to make an API call"""
        now = time.time()
        
        # Remove timestamps outside the current period
        self.timestamps = [ts for ts in self.timestamps if now - ts <= self.period]
        
        if len(self.timestamps) >= self.calls:
            # Wait until the oldest timestamp is outside the period
            sleep_time = self.timestamps[0] + self.period - now
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
                return await self.acquire()
        
        self.timestamps.append(now)
        return True

class APICache:
    """Cache for API responses"""
    
    def __init__(self, cache_dir: Path = CACHE_DIR):
        """
        Initialize cache
        
        Args:
            cache_dir: Directory to store cache files
        """
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_cache_key(self, url: str, params: Dict[str, Any]) -> str:
        """Generate cache key from URL and parameters"""
        cache_data = f"{url}:{json.dumps(params, sort_keys=True)}"
        return hashlib.sha256(cache_data.encode()).hexdigest()
    
    def _get_cache_path(self, key: str) -> Path:
        """Get cache file path for key"""
        return self.cache_dir / f"{key}.json"
    
    def get(self, url: str, params: Dict[str, Any], ttl: int) -> Optional[Dict[str, Any]]:
        """
        Get cached response if available and not expired
        
        Args:
            url: API endpoint URL
            params: Query parameters
            ttl: Time to live in seconds
        
        Returns:
            Cached response or None if not found/expired
        """
        cache_key = self._get_cache_key(url, params)
        cache_path = self._get_cache_path(cache_key)
        
        if cache_path.exists():
            try:
                with cache_path.open('r') as f:
                    cached_data = json.load(f)
                
                # Check if cache is expired
                cached_time = datetime.fromisoformat(cached_data['timestamp'])
                if datetime.now() - cached_time < timedelta(seconds=ttl):
                    logger.debug(f"Cache hit for {url}")
                    return cached_data['data']
            except Exception as e:
                logger.warning(f"Error reading cache: {e}")
        
        return None
    
    def set(self, url: str, params: Dict[str, Any], data: Dict[str, Any]):
        """
        Cache API response
        
        Args:
            url: API endpoint URL
            params: Query parameters
            data: Response data to cache
        """
        cache_key = self._get_cache_key(url, params)
        cache_path = self._get_cache_path(cache_key)
        
        try:
            cache_data = {
                'timestamp': datetime.now().isoformat(),
                'data': data
            }
            with cache_path.open('w') as f:
                json.dump(cache_data, f)
            logger.debug(f"Cached response for {url}")
        except Exception as e:
            logger.warning(f"Error writing cache: {e}")

class APIClient:
    """Async API client with rate limiting and caching"""
    
    def __init__(self, service: str):
        """
        Initialize API client
        
        Args:
            service: Service name from API_CONFIG
        """
        self.config = API_CONFIG[service]
        self.rate_limiter = RateLimiter(
            calls=self.config['rate_limit'],
            period=1.0
        )
        self.cache = APICache()
        self.session = None
    
    async def __aenter__(self):
        """Create aiohttp session"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()
    
    async def get(self, endpoint: str, params: Dict[str, Any] = None, 
                 cache_ttl: Optional[int] = None) -> Dict[str, Any]:
        """
        Make GET request with rate limiting and caching
        
        Args:
            endpoint: API endpoint path
            params: Query parameters
            cache_ttl: Cache TTL in seconds, None to disable caching
        
        Returns:
            API response data
        """
        url = f"{self.config['base_url']}/{endpoint.lstrip('/')}"
        params = params or {}
        
        # Check cache first
        if cache_ttl is not None:
            cached_data = self.cache.get(url, params, cache_ttl)
            if cached_data is not None:
                return cached_data
        
        # Apply rate limiting
        await self.rate_limiter.acquire()
        
        # Make request with retries
        for attempt in range(self.config['retries']):
            try:
                async with self.session.get(url, params=params) as response:
                    response.raise_for_status()
                    data = await response.json()
                    
                    # Cache successful response
                    if cache_ttl is not None:
                        self.cache.set(url, params, data)
                    
                    return data
            except Exception as e:
                logger.warning(f"API request failed (attempt {attempt + 1}): {e}")
                if attempt < self.config['retries'] - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise
    
    async def get_batch(self, items: list, endpoint: str, 
                       params_func: Callable[[Any], Dict[str, Any]],
                       cache_ttl: Optional[int] = None) -> list:
        """
        Make batch GET requests
        
        Args:
            items: List of items to process
            endpoint: API endpoint path
            params_func: Function to generate parameters for each item
            cache_ttl: Cache TTL in seconds, None to disable caching
        
        Returns:
            List of API responses
        """
        tasks = []
        for i in range(0, len(items), self.config['batch_size']):
            batch = items[i:i + self.config['batch_size']]
            for item in batch:
                params = params_func(item)
                tasks.append(self.get(endpoint, params, cache_ttl))
        
        return await asyncio.gather(*tasks) 