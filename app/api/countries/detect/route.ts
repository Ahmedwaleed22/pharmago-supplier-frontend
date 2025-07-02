import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the user's IP address from the request
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp;
    
    // For localhost/development, try to detect real IP first, then use external IP detection
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
      try {
        // Try to get real IP using external service
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const realIp = ipData.ip;
        
        if (realIp && realIp !== '127.0.0.1') {
          // Use the real IP for geolocation
          const geoResponse = await fetch(`https://ipapi.co/${realIp}/json/`, {
            headers: {
              'User-Agent': 'pharmago-frontend/1.0'
            }
          });
          
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            return NextResponse.json({ 
              country_code: geoData.country_code || 'US',
              method: 'external-ip-geolocation',
              detected_ip: realIp
            });
          }
        }
      } catch (error) {
        console.log('External IP detection failed, falling back to language detection');
      }
      
      // Fallback to language detection
      const acceptLanguage = request.headers.get('Accept-Language') || '';
      const countryFromLanguage = extractCountryFromLanguage(acceptLanguage);
      return NextResponse.json({ 
        country_code: countryFromLanguage || 'US',
        method: 'language-fallback'
      });
    }

    // Use ipapi.co for IP geolocation (free service)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'pharmago-frontend/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('IP geolocation service failed');
    }

    const data = await response.json();
    
    // Return the country code
    return NextResponse.json({ 
      country_code: data.country_code || 'US',
      method: 'ip-geolocation'
    });
    
  } catch (error: any) {
    console.error('Country detection error:', error);
    
    // Fallback to US if everything fails
    return NextResponse.json(
      { 
        country_code: 'US',
        method: 'fallback',
        error: error.message 
      },
      { status: 200 } // Still return 200 with fallback
    );
  }
}

// Helper function to extract country from Accept-Language header
function extractCountryFromLanguage(acceptLanguage: string): string | null {
  // Parse Accept-Language header like "en-US,en;q=0.9,ar;q=0.8"
  const languageRegex = /[a-z]{2}-([A-Z]{2})/;
  const match = acceptLanguage.match(languageRegex);
  return match ? match[1] : null;
} 