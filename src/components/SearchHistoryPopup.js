import React from 'react';
import { X, Search, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

function SearchHistoryPopup({ isOpen, onClose, searchData }) {
  if (!isOpen || !searchData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-xl p-6 m-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Search Result</h3>
            <p className="text-gray-500 mt-1">View detailed search information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center mb-2">
              <Search size={18} className="text-blue-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-800">Search Query</h4>
            </div>
            <p className="text-gray-700">{searchData.query}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center mb-2">
              <Clock size={18} className="text-gray-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-800">Response</h4>
            </div>
            <div className="prose prose-sm md:prose lg:prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {searchData.response}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchHistoryPopup; 