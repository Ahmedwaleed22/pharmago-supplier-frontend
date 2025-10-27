import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createTranslatedErrorResponse, getLocaleFromRequest } from '@/lib/api-i18n';

export async function POST(
  request: NextRequest,
  { params }: { params: { offerId: string } }
) {
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
    
    // Parse request body
    const body = await request.json();
    
    // Forward the request to the actual API with the auth token
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SUPPLIER_URL}/chat/offers/${params.offerId}/accept`,
      body,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': cookieHeader,
          'Accept-Language': locale
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data);
  } catch (error: any) {
    const locale = getLocaleFromRequest(request);
    console.error('Chat accept offer API route error:', error);
    
    // Return appropriate error response with translation
    const errorResponse = await createTranslatedErrorResponse(
      error, 
      error.response?.status || 500, 
      locale
    );
    return NextResponse.json(errorResponse, { status: error.response?.status || 500 });
  }
}

