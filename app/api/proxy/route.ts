import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { headers as nextHeaders } from 'next/headers';
import FormData from 'form-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_PHARMACY_URL || '';

// Helper function to get Accept-Language header from locale
function getAcceptLanguageHeader(request: NextRequest, headersFromBody?: Record<string, string>): string {
  // First check if Accept-Language is provided in the request body headers
  if (headersFromBody && headersFromBody['Accept-Language']) {
    return headersFromBody['Accept-Language'];
  }
  
  // Then try to get locale from cookie
  const locale = request.cookies.get('locale')?.value || 'en';
  
  return locale || 'en';
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-URL',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Generic handler for all methods
export async function POST(request: NextRequest) {
  try {
    console.log('POST proxy request received');
    
    const headersList = nextHeaders();
    const contentType = request.headers.get('Content-Type') || '';
    const targetUrlHeader = request.headers.get('X-Target-URL');
    
    // Handle FormData/multipart requests
    if (contentType.includes('multipart/form-data')) {
      if (!targetUrlHeader) {
        console.error('Missing X-Target-URL header for multipart request');
        return NextResponse.json({ message: 'X-Target-URL header is required for multipart requests' }, { status: 400 });
      }
      
      // Get full URL to forward request to
      const fullUrl = `${API_BASE_URL}/${targetUrlHeader.startsWith('/') ? targetUrlHeader.slice(1) : targetUrlHeader}`;
      console.log(`Forwarding multipart request to: ${fullUrl}`);
      
      // Get FormData from request
      const formData = await request.formData();
      
      // Forward headers except host and other hop-by-hop headers
      const forwardedHeaders: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
          forwardedHeaders[key] = value;
        }
      });
      
      // Add Accept-Language header based on locale
      forwardedHeaders['Accept-Language'] = getAcceptLanguageHeader(request, {});
      
      // Forward the request with FormData
      try {
        const response = await axios.post(fullUrl, formData, {
          headers: forwardedHeaders
        });
        
        return NextResponse.json(response.data, {
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-URL',
          }
        });
      } catch (error: any) {
        console.error('Multipart request error:', error);
        
        // Log more detailed error information
        if (error.response) {
          console.error('Error response:', {
            status: error.response.status,
            data: error.response.data
          });
        }
        
        return NextResponse.json(
          { message: error.message, error: error.response?.data || 'Unknown error' },
          { 
            status: error.response?.status || 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-URL',
            }
          }
        );
      }
    }
    
    // Handle JSON requests (original implementation)
    // Parse the request body
    let body;
    try {
      body = await request.json();
      console.log('Request body received:', JSON.stringify(body));
    } catch (e) {
      console.error('Error parsing JSON body:', e);
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }
    
    const { endpoint, method = 'post', data = {}, headers = {}, formData = null, isFormData = false } = body;

    if (!endpoint) {
      console.error('Missing endpoint parameter');
      return NextResponse.json({ message: 'Endpoint parameter is required' }, { status: 400 });
    }

    console.log(`Proxy ${method.toUpperCase()} request for endpoint: ${endpoint}`);

    // Ensure API_BASE_URL is valid
    if (!API_BASE_URL) {
      console.error('API_BASE_URL env variable is not defined');
      return NextResponse.json({ message: 'API configuration error' }, { status: 500 });
    }
    
    // Safe URL construction using string concatenation
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const endpointPath = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const apiTargetUrl = baseUrl + '/' + endpointPath;
    
    console.log(`Making ${method.toUpperCase()} request to: ${apiTargetUrl}`);
    
    // Set common headers
    const acceptLanguage = getAcceptLanguageHeader(request, headers);
    console.log(`Setting Accept-Language header to: ${acceptLanguage}`);
    
    const requestHeaders = {
      ...headers,
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
      'Accept-Language': acceptLanguage
    };

    let response;
    
    try {
      // Special handling for FormData passed as JSON
      if (isFormData && formData) {
        console.log('Processing FormData request');
        
        // Create a new FormData object
        const serverFormData = new FormData();
        
        // Recreate the form data on the server side
        Object.entries(formData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(item => {
              if (item && typeof item === 'object' && 'name' in item && 'type' in item && 'data' in item) {
                // This is a file object
                const buffer = Buffer.from(item.data);
                serverFormData.append(key, buffer, {
                  filename: item.name,
                  contentType: item.type
                });
              } else {
                serverFormData.append(key, item);
              }
            });
          } else if (value && typeof value === 'object' && 'name' in value && 'type' in value && 'data' in value) {
            // This is a file object
            const buffer = Buffer.from(value.data as string);
            serverFormData.append(key, buffer, {
              filename: value.name as string,
              contentType: value.type as string
            });
          } else {
            serverFormData.append(key, value);
          }
        });
        
        // Send the form data
        response = await axios.post(apiTargetUrl, serverFormData, {
          headers: {
            ...requestHeaders,
            ...serverFormData.getHeaders(),
            'Accept-Language': getAcceptLanguageHeader(request, headers)
          }
        });
      } else {
        // Use axios with the appropriate method
        if (method.toLowerCase() === 'get') {
          response = await axios.get(apiTargetUrl, { headers: requestHeaders });
        } else if (method.toLowerCase() === 'put') { 
          response = await axios.put(apiTargetUrl, data, { headers: requestHeaders });
        } else if (method.toLowerCase() === 'delete') {
          response = await axios.delete(apiTargetUrl, { headers: requestHeaders });
        } else {
          // Default to POST
          response = await axios.post(apiTargetUrl, data, { headers: requestHeaders });
        }
      }
      
      console.log(`${method.toUpperCase()} request successful with status: ${response.status}`);
      
      return NextResponse.json(response.data, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-URL',
        }
      });
    } catch (error: any) {
      throw error; // Let the outer catch handle it
    }
  } catch (error: any) {
    console.error('Proxy error:', error);
    
    // Log more detailed error information
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Check if the API server is running.');
    }
    if (error.config) {
      console.error('Error request config:', {
        url: error.config.url,
        method: error.config.method,
        data: error.config.data
      });
    }
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    return NextResponse.json(
      { message: error.message, error: error.response?.data || 'Unknown error' },
      { 
        status: error.response?.status || 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-URL',
        }
      }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET proxy request received');
    
    // Extract endpoint parameter
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint');
    
    if (!endpoint) {
      console.error('Missing endpoint parameter in GET request');
      return NextResponse.json({ message: 'Endpoint parameter is required' }, { status: 400 });
    }
    
    console.log(`Proxy GET request for: ${endpoint}`);
    
    // Ensure API_BASE_URL is valid
    if (!API_BASE_URL) {
      console.error('API_BASE_URL env variable is not defined');
      return NextResponse.json({ message: 'API configuration error' }, { status: 500 });
    }
    
    // Forward request to our POST handler by creating a similar payload
    const requestHeaders: Record<string, string> = {};
    const authHeader = request.headers.get('Authorization');
    if (authHeader) requestHeaders['Authorization'] = authHeader;
    
    // Add Accept-Language header based on locale
    requestHeaders['Accept-Language'] = getAcceptLanguageHeader(request, {});
    
    const payload = {
      method: 'get',
      endpoint,
      headers: requestHeaders
    };
    
    // Reuse our POST handler logic
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(payload)
    });
    
    return POST(postRequest);
  } catch (error) {
    console.error('GET proxy error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 