import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_PHARMACY_URL || '';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Generic handler for all methods
export async function POST(request: NextRequest) {
  try {
    console.log('POST proxy request received');
    
    // Parse the request body
    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body));
    
    const { endpoint, method = 'post', data = {}, headers = {} } = body;

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
    const targetUrl = baseUrl + '/' + endpointPath;
    
    console.log(`Making ${method.toUpperCase()} request to: ${targetUrl}`);
    
    // Set common headers
    const requestHeaders = {
      ...headers,
      'Content-Type': 'application/json'
    };

    let response;
    
    try {
      // Use axios with the appropriate method
      if (method.toLowerCase() === 'get') {
        response = await axios.get(targetUrl, { headers: requestHeaders });
      } else if (method.toLowerCase() === 'put') { 
        response = await axios.put(targetUrl, data, { headers: requestHeaders });
      } else if (method.toLowerCase() === 'delete') {
        response = await axios.delete(targetUrl, { headers: requestHeaders });
      } else {
        // Default to POST
        response = await axios.post(targetUrl, data, { headers: requestHeaders });
      }
      
      console.log(`${method.toUpperCase()} request successful with status: ${response.status}`);
      
      return NextResponse.json(response.data, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const headers: Record<string, string> = {};
    const authHeader = request.headers.get('Authorization');
    if (authHeader) headers['Authorization'] = authHeader;
    
    const payload = {
      method: 'get',
      endpoint,
      headers
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