import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createTranslatedErrorResponse, getLocaleFromRequest } from '@/lib/api-i18n';

export async function GET(
  request: NextRequest,
  { params }: { params: { buyerId: string; medicineId: string } }
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
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const per_page = searchParams.get('per_page') || '50';
    
    // Forward the request to the actual API with the auth token and query parameters
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SUPPLIER_URL}/chat/${params.buyerId}/${params.medicineId}/messages`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': cookieHeader,
          'Accept-Language': locale
        },
        params: {
          page,
          per_page
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data);
  } catch (error: any) {
    const locale = getLocaleFromRequest(request);
    console.error('Chat messages API route error:', error);
    
    // Return appropriate error response with translation
    const errorResponse = await createTranslatedErrorResponse(
      error, 
      error.response?.status || 500, 
      locale
    );
    return NextResponse.json(errorResponse, { status: error.response?.status || 500 });
  }
}

