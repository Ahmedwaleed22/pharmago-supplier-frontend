import React from "react";

interface ChartSkeletonProps {
  className?: string;
  height?: string;
}

function ChartSkeleton({ className = "", height = "h-64" }: ChartSkeletonProps) {
  return (
    <div className={`bg-white rounded-xl px-4 py-5 shadow-sm h-full animate-pulse ${className}`}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className={`bg-transparent rounded ${height} min-h-[300px] flex items-end justify-center space-x-1 p-4`}>
          {/* Simulate area chart */}
          <div className="w-full h-full bg-gray-100 rounded relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-3/4 bg-gradient-to-t from-gray-200 to-transparent rounded"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChartSkeleton; 