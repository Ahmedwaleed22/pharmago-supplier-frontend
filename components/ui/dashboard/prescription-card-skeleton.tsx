import React from "react";

function PrescriptionCardSkeleton() {
  return (
    <div className="w-full h-full rounded-lg p-4 flex flex-col gap-4 bg-white shadow-sm animate-pulse">
      {/* Header with icon and title */}
      <div className="flex gap-1 items-center">
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="h-5 bg-gray-200 rounded w-32"></div>
      </div>
      
      {/* Prescription details section */}
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Patient info section */}
      <div className="text-sm space-y-2">
        <div className="flex items-center gap-1">
          <div className="h-3 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}

export default PrescriptionCardSkeleton; 