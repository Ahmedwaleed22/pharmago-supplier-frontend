import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get response
  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Locale, Accept-Language');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Extract locale from various sources
  let locale = 'en'; // default

  // Try to get locale from cookie
  const localeCookie = request.cookies.get('locale')?.value;
  if (localeCookie && ['en', 'ar', 'fr'].includes(localeCookie)) {
    locale = localeCookie;
  } else {
    // Try to get from Accept-Language header
    const acceptLanguage = request.headers.get('Accept-Language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
      if (['en', 'ar', 'fr'].includes(preferredLocale)) {
        locale = preferredLocale;
      }
    }
  }

  // Add locale to request headers for API routes
  response.headers.set('X-Locale', locale);
  
  return response;
}

// Configure middleware to run on all routes
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Always run for API routes
    '/api/:path*'
  ],
}; 