const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const Database = require('./database/db');
const { validateProfileData, sanitizeProfileData } = require('./server/validation');
const { logError, logInfo, logHttp } = require('./logger');

const app = express();
let db;

// Initialize database and start server
async function startServer() {
  try {
    db = new Database('medivue');
    await db.init();
    
    const port = process.env.PORT || 3002;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Define valid categories for validation
const VALID_CATEGORIES = {
  has_allergens: ['yes', 'no'],
  blood_present: ['yes', 'no'],
  pain_location: ['None', 'full_abdomen', 'lower_abdomen', 'upper_abdomen'],
  pain_time: ['None', 'afternoon', 'evening', 'morning', 'night', 'variable'],
  medication_taken: ['yes', 'no'],
  medication_type: ['None', 'biologic', 'immunosuppressant', 'steroid'],
  menstruation: ['yes', 'no', 'not_applicable']
};

// Function to validate and normalize data
function validateAndNormalizeData(data) {
  console.log('Validating data:', JSON.stringify(data, null, 2));
  
  const errors = [];
  const normalizedData = { ...data };

  // Validate and normalize categorical fields
  Object.entries(VALID_CATEGORIES).forEach(([field, validValues]) => {
    const value = String(data[field]).toLowerCase();
    const normalizedValue = value === 'none' ? 'None' : validValues.find(v => v.toLowerCase() === value);
    
    if (!normalizedValue) {
      errors.push(`Invalid value for ${field}. Must be one of: ${validValues.join(', ')}`);
    }
    normalizedData[field] = normalizedValue;
  });

  // Validate numeric fields
  const numericFields = [
    'calories', 'protein', 'carbs', 'fiber', 'meals_per_day',
    'hydration_level', 'bowel_frequency', 'bristol_scale',
    'urgency_level', 'pain_severity', 'dosage_level',
    'sleep_hours', 'stress_level', 'fatigue_level'
  ];

  numericFields.forEach(field => {
    const value = Number(data[field]);
    if (isNaN(value)) {
      errors.push(`${field} must be a number`);
    }
    normalizedData[field] = value;
  });

  if (errors.length > 0) {
    console.error('Validation failed:', errors.join('\n'));
    console.error('Failed data:', JSON.stringify(data, null, 2));
    throw new Error(errors.join('\n'));
  }

  console.log('Validation successful:', JSON.stringify(normalizedData, null, 2));
  return normalizedData;
}

let flarePredictor = null;

// Remove direct model loading since we're using Python Flask server
console.log('Using Flask ML server for predictions at http://localhost:5000');

// Bearer token from working URL
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA0YWQ1ODZhLTQ5ZWItNGM5YS05YTY3LWZlMDRjZWU1NWU3ZiJ9.19fEj8cbDdpHdcivJZS16hGgP2-pVe6RJMYiu7j4r7o';

const flareApiClient = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Enable CORS for all routes with preflight
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase server timeout to 10 minutes
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000); // 10 minutes
  next();
});

// Add JSON body parsing middleware
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request
  logInfo('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body
  });

  // Override end to capture response
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - start;
    logHttp(req, res, responseTime);
    originalEnd.apply(res, args);
  };

  next();
});

// Mock data for when ML model is not available
const mockPrediction = {
  prediction: 0,
  probability: 0.1,
  interpretation: 'Mock prediction (ML model not loaded)',
  confidence: '10%'
};

const mockStats = {
  total_predictions: 10,
  total_flares: 2,
  avg_flare_probability: 0.15
};

const mockPredictions = Array.from({ length: 10 }, (_, i) => ({
  prediction_timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  prediction: Math.random() > 0.8 ? 1 : 0,
  probability: Math.random()
}));

// Flare predictor endpoints
app.post('/api/predict-flare', async (req, res) => {
  try {
    // Validate and normalize the data
    const normalizedData = validateAndNormalizeData(req.body);
    
    const response = await flareApiClient.post('/predict', normalizedData);
    res.json(response.data);
  } catch (error) {
    console.error('Prediction error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: error.message,
        details: error.message,
        mockData: {
          prediction: 0,
          probability: 0.1,
          interpretation: 'Mock prediction (ML model not available)',
          confidence: '10%'
        }
      });
    }
  }
});

app.get('/api/flare-statistics', async (req, res) => {
  try {
    const response = await flareApiClient.get('/statistics', { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error('Statistics error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'Failed to get statistics', 
        details: error.message,
        mockData: {
          total_predictions: 10,
          total_flares: 2,
          avg_flare_probability: 0.15
        }
      });
    }
  }
});

app.get('/api/recent-predictions', async (req, res) => {
  try {
    const response = await flareApiClient.get('/recent-predictions', { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error('Recent predictions error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ 
        error: 'Failed to get recent predictions', 
        details: error.message,
        mockData: Array.from({ length: 10 }, (_, i) => ({
          prediction_timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          prediction: Math.random() > 0.8 ? 1 : 0,
          probability: Math.random()
        }))
      });
    }
  }
});

// Create axios instance with configuration
const openWebUIClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 600000, // 10 minutes timeout
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${BEARER_TOKEN}`
  }
});

// Function to clean up response text
function formatResponse(text) {
  if (!text) return text;
  
  // First, remove <think> tags and their content completely
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '');
  
  // Handle sections (###) - Convert to proper markdown headers
  text = text.replace(/###\s+(.*?)(?=###|$)/g, '\n## $1\n\n');
  
  // Handle bullet points with proper formatting
  text = text.replace(/[•-]\s+(.*?)(?=[•-]|\n|$)/g, '* $1\n'); // Convert bullets and dashes
  
  // Handle nested bullet points
  text = text.replace(/^\s+[•-]\s*(.*?)$/gm, '  * $1');
  
  // Handle bold text - ensure proper spacing and format
  text = text.replace(/\*\*(.*?)\*\*/g, '**$1**');
  
  // Handle emphasis and italics
  text = text.replace(/_(.*?)_/g, '*$1*');
  
  // Handle code blocks and inline code
  text = text.replace(/`(.*?)`/g, '`$1`');
  
  // Add proper list formatting
  text = text.replace(/^\* /gm, '* '); // Ensure proper bullet point format
  
  // Clean up multiple newlines while preserving intentional spacing
  text = text.replace(/\n{4,}/g, '\n\n\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Clean up multiple spaces
  text = text.replace(/\s{2,}/g, ' ');
  
  // Add spacing after periods for better readability
  text = text.replace(/\.\s+/g, '.\n');
  
  // Ensure proper spacing around sections
  text = text.replace(/\n##\s/g, '\n\n## ');
  text = text.replace(/##(.*?)\n/g, '## $1\n\n');
  
  // Clean up any remaining markdown artifacts while preserving intended formatting
  text = text.replace(/\[|\]|\(|\)/g, '');
  
  // Ensure proper list spacing
  text = text.replace(/(\* .*?\n)(?=\* )/g, '$1\n');
  
  // Format numbered lists
  text = text.replace(/^\d+\.\s+(.*?)$/gm, '1. $1');
  
  // Add proper spacing for nested lists
  text = text.replace(/(\* .*?\n)(?=  \* )/g, '$1');
  
  // Trim whitespace while preserving internal formatting
  text = text.trim();
  
  return text;
}

// Create a specific route for chat completions
app.post('/api/chat/completions', async (req, res) => {
  // Handle client disconnect
  req.on('close', () => {
    console.log('Client disconnected');
  });

  try {
    const { user_id, messages } = req.body;
    const query = messages[0].content;

    // Ensure user exists in database if user_id is provided
    if (user_id) {
      const userExists = await db.ensureUserExists({
        user_id,
        first_name: req.body.variables?.["{{USER_NAME}}"] || 'Mock',
        email: `${user_id}@example.com`
      });
      
      if (!userExists) {
        throw new Error('Failed to ensure user exists in database');
      }

      // First check if we have this search in history (within last 7 days)
      const searchHistory = await db.getSearchHistory(user_id);
      const existingSearch = searchHistory.find(s => s.query === query);
      if (existingSearch) {
        console.log('Found search in history');
        return res.json({
          choices: [{
            message: {
              content: existingSearch.response
            }
          }]
        });
      }
    }

    console.log('Forwarding request to OpenWebUI');
    const response = await openWebUIClient.post('/api/chat/completions', req.body);

    // Save the search if we have a user_id
    if (user_id && response.data.choices && response.data.choices[0]) {
      const responseContent = response.data.choices[0].message.content;
      await db.saveSearch({
        user_id,
        query,
        response: responseContent
      });
    }

    // Check if client is still connected before sending response
    if (!res.headersSent) {
      // Format the response if it contains a message
      if (response.data && response.data.choices && response.data.choices[0]) {
        const choice = response.data.choices[0];
        if (choice.message && choice.message.content) {
          choice.message.content = formatResponse(choice.message.content);
          // Log the formatted content for debugging
          console.log('Formatted content:', choice.message.content);
        }
      }

      res.status(response.status).json(response.data);
    } else {
      console.log('Client disconnected, response not sent');
    }
  } catch (error) {
    console.error('Error:', error.message);
    
    // Only send error response if client is still connected
    if (!res.headersSent) {
      if (error.response) {
        // Forward the error response from the OpenWebUI server
        res.status(error.response.status).json(error.response.data);
      } else if (error.code === 'ECONNABORTED') {
        // Handle timeout error
        res.status(504).json({ error: 'Request timeout', details: 'Request timeout (10 minutes)' });
      } else {
        res.status(500).json({ error: 'Proxy error', details: error.message });
      }
    }
  }
});

// Add endpoints for search history
app.get('/api/search/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;
    const history = await db.getSearchHistory(userId, days);
    res.json(history);
  } catch (error) {
    console.error('Error getting search history:', error);
    res.status(500).json({ error: 'Failed to get search history' });
  }
});

app.get('/api/search/recent/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 3 } = req.query;
    const recent = await db.getRecentSearches(userId, limit);
    res.json(recent);
  } catch (error) {
    console.error('Error getting recent searches:', error);
    res.status(500).json({ error: 'Failed to get recent searches' });
  }
});

// User profile endpoints
app.put('/api/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updateData = req.body;

    // Validate the profile data
    const validation = validateProfileData(updateData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Sanitize the data before saving
    const sanitizedData = sanitizeProfileData(updateData);

    // Check if user exists
    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If username is being updated, validate it
    if (sanitizedData.username) {
      // Check username format
      if (!/^[a-zA-Z0-9]{1,12}$/.test(sanitizedData.username)) {
        return res.status(400).json({ 
          error: 'Invalid username format',
          details: 'Username must be 1-12 characters long and contain only letters and numbers'
        });
      }

      // Check if username is already taken by another user
      try {
        const existingUser = await db.get(
          'SELECT user_id FROM users WHERE username = ? AND user_id != ?', 
          [sanitizedData.username, userId]
        );
        if (existingUser) {
          return res.status(400).json({ error: 'Username is already taken' });
        }
      } catch (error) {
        // If error is due to missing column, create it
        if (error.code === 'SQLITE_ERROR' && error.message.includes('no such column: username')) {
          await db.run('ALTER TABLE users ADD COLUMN username TEXT UNIQUE');
        } else {
          throw error;
        }
      }
    }

    // Update user profile
    await db.updateUser(userId, sanitizedData);

    // Get updated user data
    const updatedUser = await db.getUserById(userId);
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile', details: error.message });
  }
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 400 ? 'error' : 'info',
      message: `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
      details: {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        userAgent: req.headers['user-agent']
      }
    };

    // Save to database
    db.run(
      'INSERT INTO logs (timestamp, level, message, details, user_agent, url) VALUES (?, ?, ?, ?, ?, ?)',
      [
        log.timestamp,
        log.level,
        log.message,
        JSON.stringify(log.details),
        log.details.userAgent,
        log.details.url
      ]
    ).catch(err => console.error('Error saving log:', err));

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`);
    }
  });
  next();
});

// Add error logging middleware
app.use((err, req, res, next) => {
    logError(err, {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body
    });
    
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Add access logging middleware
app.use((req, res, next) => {
    const startTime = Date.now();
    
    // Capture the original end function
    const originalEnd = res.end;
    
    // Override the end function
    res.end = function(...args) {
        const responseTime = Date.now() - startTime;
        
        logInfo(req, res, {
            responseTime,
            timestamp: new Date().toISOString()
        });
        
        originalEnd.apply(res, args);
    };
    
    next();
});

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    logError(error, {
        type: 'uncaughtException',
        timestamp: new Date().toISOString()
    });
});

// Add error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logError(reason, {
        type: 'unhandledRejection',
        timestamp: new Date().toISOString()
    });
});

// Logging endpoints
app.post('/api/logs', async (req, res) => {
  try {
    const logEntry = req.body;
    await db.run(
      'INSERT INTO logs (timestamp, level, message, details, user_agent, url) VALUES (?, ?, ?, ?, ?, ?)',
      [
        logEntry.timestamp,
        logEntry.level,
        logEntry.message,
        JSON.stringify(logEntry.details),
        logEntry.userAgent,
        logEntry.url
      ]
    );
    res.status(201).json({ message: 'Log saved successfully' });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ error: 'Failed to save log' });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const { level, search, startDate, endDate, limit = 100 } = req.query;
    let sql = 'SELECT * FROM logs WHERE 1=1';
    const params = [];

    if (level) {
      sql += ' AND level = ?';
      params.push(level);
    }

    if (search) {
      sql += ' AND (message LIKE ? OR details LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (startDate) {
      sql += ' AND timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND timestamp <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    const logs = await db.all(sql, params);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Add log cleanup job
setInterval(async () => {
  try {
    // Keep logs for 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await db.run('DELETE FROM logs WHERE timestamp < ?', [thirtyDaysAgo.toISOString()]);
    console.log('Cleaned up old logs');
  } catch (error) {
    console.error('Error cleaning up logs:', error);
  }
}, 24 * 60 * 60 * 1000); // Run daily

// Handle server errors
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Keep the server running despite uncaught exceptions
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Keep the server running despite unhandled rejections
}); 