import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    const params = request.nextUrl.searchParams;
    
    // Get query parameters
    const categoryId = params.get('category_id') || '';
    const search = params.get('search') || '';
    const page = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || '12', 10);
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/pharmacy_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Construct API URL with all parameters
    const apiUrl = `${process.env.NEXT_PUBLIC_PHARMACY_URL}/products`;
        
    // Forward the request to the actual API with the auth token and pagination
    const response = await axios.get(apiUrl, { 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': cookieHeader
      },
      params: {
        category_id: categoryId,
        search,
        page,
        per_page: limit
      }
    });

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