import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorScreen = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mx-auto mb-4" />
        
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-2">
          Oops! Something went wrong
        </h2>
        
        <p className="text-neutral-600 text-center max-w-md text-sm sm:text-base mb-6">
          {error}
        </p>
        
        <button
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-md transition-all duration-200 text-sm sm:text-base"
          onClick={onRetry}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs sm:text-sm text-neutral-500">
          If the problem persists, please check your internet connection
        </p>
      </div>
    </div>
  );
};

export default ErrorScreen;