import React from "react";

function StatisticCardSkeleton() {
  return (
    <div className="bg-white rounded-xl px-4 py-5 shadow-sm h-full min-w-[200px] flex-1 animate-pulse">
      <div className="flex gap-10 flex-col">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="bg-gray-100 rounded-sm px-2 py-1 flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticCardSkeleton; 