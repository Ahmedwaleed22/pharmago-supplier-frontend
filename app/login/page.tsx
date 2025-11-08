"use client";

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  useEffect(() => {
    // Redirect to home page
    if (message) {
      router.push(`/?message=${message}`)
    } else {
      router.push('/')
    }
  }, [router, message])

  return (
    <div className="flex h-screen w-full bg-[#F4F4F4] items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}

function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full bg-[#F4F4F4] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          {/* <p className="mt-2 text-sm text-gray-600">Loading...</p> */}
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

export default LoginPage;