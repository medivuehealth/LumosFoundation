import React from 'react';
import { AlertCircle, X } from 'lucide-react';

function Toast({ open, message, severity, details = [], onClose }) {
  if (!open) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96 bg-white rounded-lg shadow-lg border border-red-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {message}
            </p>
            {details.length > 0 && (
              <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                {details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Toast; 