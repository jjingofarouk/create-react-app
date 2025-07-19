import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Skeleton height={32} width={200} />
          <div className="flex items-center gap-4">
            <Skeleton circle height={40} width={40} />
            <Skeleton height={36} width={80} />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <Skeleton height={28} width={150} className="mb-2" />
          <Skeleton height={20} width={300} />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-neutral-200 p-6">
              <Skeleton height={24} width={100} className="mb-3" />
              <Skeleton height={32} width={80} className="mb-2" />
              <Skeleton height={16} width={150} />
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <Skeleton height={24} width={200} />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  {[...Array(5)].map((_, i) => (
                    <th key={i} className="px-6 py-3 text-left">
                      <Skeleton height={20} width={80} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-neutral-100">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <Skeleton height={16} width={j === 0 ? 120 : j === 1 ? 80 : 60} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-center py-3 px-1">
                <Skeleton circle height={20} width={20} className="mb-1" />
                <Skeleton height={12} width={40} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;