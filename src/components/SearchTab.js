import React, { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import SearchHistoryPopup from './SearchHistoryPopup';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import config from '../config';

function SearchTab({ currentUser }) {
  const [inputValue, setInputValue] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from database on component mount and when user changes
  useEffect(() => {
    if (currentUser?.user_id) {
      fetchRecentSearches();
    }
  }, [currentUser]);

  const fetchRecentSearches = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/search/recent/${currentUser.user_id}?limit=3`);
      if (!response.ok) throw new Error('Failed to fetch recent searches');
      const data = await response.json();
      setRecentSearches(data);
    } catch (error) {
      console.error('Error fetching recent searches:', error);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setErrorDetails('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorDetails('');
    setSearchResult('');
    
    try {
      const response = await fetch(`${config.API_URL}/api/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: inputValue,
          user_id: currentUser.user_id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response not OK:', response.status, errorText);
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected response format:', data);
        throw new Error('Received invalid response format from server');
      }

      const responseContent = data.choices[0].message.content;
      setSearchResult(responseContent);
      
      // Reload recent searches after a successful search
      if (currentUser?.user_id) {
        fetchRecentSearches();
      }
    } catch (error) {
      console.error('Error performing search:', error);
      setErrorDetails(error.message || 'Unknown error occurred');
      setSearchResult('An error occurred during search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = (search) => {
    setSelectedSearch(search);
    setIsPopupOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Medical AI Search</h2>
        <p className="text-gray-600 mb-4">Search our comprehensive medical knowledge base powered by AI</p>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Ask a medical question..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            onClick={handleSubmit}
            className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search Medical Database'}
          </button>
          {searchResult && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="prose prose-sm md:prose lg:prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {searchResult}
                </ReactMarkdown>
              </div>
              {errorDetails && (
                <p className="text-sm text-red-600 mt-2">Error details: {errorDetails}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {recentSearches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Searches</h3>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                onClick={() => handleSearchClick(search)}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-800 font-medium">{search.query}</p>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                <div className="prose prose-sm max-w-none mt-1 line-clamp-2">
                  <ReactMarkdown>
                    {search.response.substring(0, 150)}...
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SearchHistoryPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        searchData={selectedSearch}
      />
    </div>
  );
}

export default SearchTab; 