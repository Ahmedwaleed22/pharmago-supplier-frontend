import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createTranslatedErrorResponse, getLocaleFromRequest } from '@/lib/api-i18n';

export async function GET(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/supplier_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      const errorResponse = await createTranslatedErrorResponse(
        new Error('Unauthorized'), 
        401, 
        locale
      );
      return NextResponse.json(errorResponse, { status: 401 });
    }
    
    // Extract skip and limit from query parameters
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '10';
    
    // Forward the request to the actual API with the auth token and query parameters
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SUPPLIER_URL}/ads`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': cookieHeader
        },
        params: {
          skip,
          limit
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data);
  } catch (error: any) {
    const locale = getLocaleFromRequest(request);
    console.error('Advertisements API route error:', error);
    
    // Return appropriate error response with translation
    const errorResponse = await createTranslatedErrorResponse(
      error, 
      error.response?.status || 500, 
      locale
    );
    return NextResponse.json(errorResponse, { status: error.response?.status || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/supplier_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      const errorResponse = await createTranslatedErrorResponse(
        new Error('Unauthorized'), 
        401, 
        locale
      );
      return NextResponse.json(errorResponse, { status: 401 });
    }
    
    // Get the form data from the request
    const formData = await request.formData();
    
    console.log(formData.get('image_0'));

    // Forward the request to the actual API with the auth token
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SUPPLIER_URL}/ads`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cookie': cookieHeader
        }
      }
    );

    console.log(response.data);
    
    // Return the API response
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const locale = getLocaleFromRequest(request);
    console.error('Advertisement creation error:', error);
    
    // Return appropriate error response with translation
    // const errorResponse = await createTranslatedErrorResponse(
    //   error, 
    //   error.response?.status || 500, 
    //   locale
    // );
    return NextResponse.json(error.response.data, { status: error.response?.status || 500 });
  }
}

 