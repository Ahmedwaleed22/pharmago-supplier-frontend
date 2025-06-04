import React from "react";

function QuickAnalyticsSkeleton() {
  return (
    <div className="bg-white rounded-xl px-4 py-5 shadow-sm h-full animate-pulse">
      <div className="flex flex-col h-full px-3 py-2">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex flex-col justify-between gap-4 h-full">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuickAnalyticsSkeleton; 