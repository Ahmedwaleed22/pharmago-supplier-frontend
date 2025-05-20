import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/pharmacy_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Forward the request to the actual API with the auth token
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_PHARMACY_URL}/products/${productId}`, 
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
    console.error('Product API route error:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product data' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const data = await params;

    const productId = data.id;
    
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/pharmacy_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the request body (FormData)
    const formData = await request.formData();
    
    if (formData.get('category_id') === "") {
      formData.delete('category_id');
    }

    // Forward the request to the actual API with the auth token
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_PHARMACY_URL}/products/${productId}?_method=PUT`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Cookie': cookieHeader
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Product update API route error:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: error.response?.status || 500 }
    );
  }
} 