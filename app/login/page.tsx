"use client";

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page
    router.push('/')
  }, [router])

  return (
    <div className="flex h-screen w-full bg-[#F4F4F4] items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}

export default LoginPage;