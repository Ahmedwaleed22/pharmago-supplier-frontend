import React from "react";

function OrderHistorySkeleton() {
  return (
    <div className="bg-white rounded-xl px-4 py-5 shadow-sm h-full animate-pulse">
      <div className="flex flex-col gap-3 p-6">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="bg-gray-100 hover:bg-gray-200 rounded px-4 py-2 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        
        {/* Table skeleton */}
        <div className="overflow-hidden shadow rounded-lg">
          <div className="min-w-full divide-y divide-gray-200">
            {/* Table header */}
            <div className="bg-gray-50 px-6 py-3 flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
            {/* Table rows */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white px-6 py-4 flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-8"></div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pagination skeleton */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="flex space-x-1">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderHistorySkeleton; 