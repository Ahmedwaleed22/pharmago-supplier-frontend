'use client'

import Link from 'next/link'
import React from 'react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation';

function NavLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {

  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href} className={cn("py-5", className, isActive && "bg-primary-blue text-white hover:bg-primary-blue-600 hover:text-white transition-all duration-300")}>
      {children}
    </Link>
  )
}

export default NavLink