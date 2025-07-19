import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Main Content Skeleton - Only the content area */}
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
    </div>
  );
};

export default LoadingScreen;