import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    const params = request.nextUrl.searchParams;
    const categoryId = params.get('category_id');
    const search = params.get('search');
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/pharmacy_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Forward the request to the actual API with the auth token
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_PHARMACY_URL}/products?category_id=${categoryId}&search=${search}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': cookieHeader
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Dashboard API route error:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: error.response?.status || 500 }
    );
  }
} 