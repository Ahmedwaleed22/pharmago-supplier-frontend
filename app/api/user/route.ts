import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getLocaleFromRequest, createTranslatedErrorResponse } from "@/lib/api-i18n";

export async function GET(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    const cookieHeader = request.headers.get('cookie') || '';
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
    
    // Try new profile endpoint first, fall back to old user endpoint
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SUPPLIER_URL}/user`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept-Language': locale,
        }
      });
      return NextResponse.json(response.data);
    } catch (newEndpointError) {
      // Fall back to old endpoint for backward compatibility
      console.log('New endpoint failed, falling back to old endpoint');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SUPPLIER_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return NextResponse.json(response.data);
    }
  } catch (error: any) {
    const locale = getLocaleFromRequest(request);
    console.error('User API route error:', error);
    
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
    const cookieHeader = request.headers.get('cookie') || '';
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
    
    // Get FormData from request
    const formData = await request.formData();
    
    // Try new profile endpoint first, fall back to old user endpoint
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SUPPLIER_URL}/user`, formData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept-Language': locale,
        } 
      });
      return NextResponse.json(response.data);
    } catch (newEndpointError) {
      // Fall back to old endpoint for backward compatibility
      console.log('New endpoint failed, falling back to old endpoint');
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SUPPLIER_URL}/user`, formData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      });
      return NextResponse.json(response.data);
    }
  } catch (error: any) {
    const locale = getLocaleFromRequest(request);
    console.error('User update API route error:', error);
    
    // const errorResponse = await createTranslatedErrorResponse(
    //   error, 
    //   error.response?.status || 500, 
    //   locale
    // );
    return NextResponse.json(error.response.data, { status: error.response?.status || 500 });
  }
}