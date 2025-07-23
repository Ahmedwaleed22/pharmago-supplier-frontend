import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getLocaleFromRequest, createTranslatedErrorResponse } from "@/lib/api-i18n";

// GET /api/branches/[id] - Get specific branch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: branchId } = await params;
    const locale = getLocaleFromRequest(request);
    
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/pharmacy_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      const errorResponse = await createTranslatedErrorResponse(
        new Error('Unauthorized'), 
        401, 
        locale
      );
      return NextResponse.json(errorResponse, { status: 401 });
    }
    
    // Forward the request to the actual API with the auth token
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_PHARMACY_URL}/branches/${branchId}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': locale,
          'Cookie': cookieHeader
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data);
  } catch (error: any) {
    const { id } = await params;
    const locale = getLocaleFromRequest(request);
    console.error(`Branch get API route error for id ${id}:`, error);
    
    // Return appropriate error response with translation
    const errorResponse = await createTranslatedErrorResponse(
      error, 
      error.response?.status || 500, 
      locale
    );
    return NextResponse.json(errorResponse, { status: error.response?.status || 500 });
  }
}

// PUT /api/branches/[id] - Update branch
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: branchId } = await params;
    const locale = getLocaleFromRequest(request);
    
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/pharmacy_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      const errorResponse = await createTranslatedErrorResponse(
        new Error('Unauthorized'), 
        401, 
        locale
      );
      return NextResponse.json(errorResponse, { status: 401 });
    }
    
    // Get the request data
    const requestData = await request.json();
    
    // Forward the request to the actual API with the auth token
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_PHARMACY_URL}/branches/${branchId}`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': locale,
          'Cookie': cookieHeader
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data);
  } catch (error: any) {
    const { id } = await params;
    const locale = getLocaleFromRequest(request);
    console.error(`Branch update API route error for id ${id}:`, error);
    
    // Return appropriate error response with translation
    const errorResponse = await createTranslatedErrorResponse(
      error, 
      error.response?.status || 500, 
      locale
    );
    return NextResponse.json(errorResponse, { status: error.response?.status || 500 });
  }
}

// DELETE /api/branches/[id] - Delete branch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: branchId } = await params;
    const locale = getLocaleFromRequest(request);
    
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/pharmacy_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      const errorResponse = await createTranslatedErrorResponse(
        new Error('Unauthorized'), 
        401, 
        locale
      );
      return NextResponse.json(errorResponse, { status: 401 });
    }
    
    // Forward the request to the actual API with the auth token
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_PHARMACY_URL}/branches/${branchId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': locale,
          'Cookie': cookieHeader
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data);
  } catch (error: any) {
    const { id } = await params;
    const locale = getLocaleFromRequest(request);
    console.error(`Branch delete API route error for id ${id}:`, error);
    
    // Return appropriate error response with translation
    const errorResponse = await createTranslatedErrorResponse(
      error, 
      error.response?.status || 500, 
      locale
    );
    return NextResponse.json(errorResponse, { status: error.response?.status || 500 });
  }
}
