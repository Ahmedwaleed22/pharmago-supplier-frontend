import React from 'react'
import Image from 'next/image'
import Link from 'next/link';

function PrescriptionCard() {
  return (
    <div className="bg-white w-full h-full shadow-sm rounded-lg p-4 flex flex-col gap-4">
      <div className="flex gap-2">
        <Image src="/images/prescriptions/prescription.svg" alt="prescription" width={24} height={24} />
        <h3 className="text-blue-gray font-semibold text-lg">Prescription Request 01</h3>
      </div>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Image src="/images/prescriptions/image-prescription.svg" alt="prescription" width={40} height={40} />
          <p className="text-blue-gray font-medium text-sm">Prescription Request 01</p>
        </div>
        <div className="flex gap-2">
          <Image className="cursor-pointer" src="/images/eye.svg" alt="eye" width={24} height={24} />
          <Image className="cursor-pointer" src="/images/download.svg" alt="download" width={24} height={24} />
        </div>
      </div>
      <div className="text-sm">
        <span className="text-blue-gray mr-1">By</span>
        <Link className="text-primary-blue font-semibold" href="">Ahmed Mohamed (Client)</Link>
        <div className="text-muted-gray mt-1">
          10 Mar 2025, 07:03 PM (live: 5min ago)
        </div>
      </div>
    </div>
  )
}

export default PrescriptionCard;