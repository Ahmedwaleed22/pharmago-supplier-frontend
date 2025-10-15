import { createTranslatedErrorResponse, getLocaleFromRequest } from "@/lib/api-i18n";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

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
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    console.log(`Delivery history API called with: status=${status}, page=${page}, limit=${limit}, search=${search}`);

    // Forward the request to the actual API with the auth token and query parameters
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SUPPLIER_URL}/delivery/history?status=${status}&search=${search}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': cookieHeader
        },
        params: {
          page,
          per_page: limit
        }
      }
    );

    console.log(`API response received for page ${page}:`, {
      totalOrders: response.data?.data?.orders?.length,
      pagination: response.data?.data?.pagination
    });
    
    // Return the API response
    return NextResponse.json(response.data);
  } catch (error: any) {
    const locale = getLocaleFromRequest(request);
    console.error('Delivery history API route error:', error);
    
    // Return appropriate error response with translation
    const errorResponse = await createTranslatedErrorResponse(
      error, 
      error.response?.status || 500, 
      locale
    );
    return NextResponse.json(errorResponse, { status: error.response?.status || 500 });
  }
}
