import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getLocaleFromRequest, createTranslatedErrorResponse } from "@/lib/api-i18n";

export async function POST(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    
    // Extract auth token from cookies (optional for forgot password, but following the pattern)
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/pharmacy_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    // Get the request data
    const { phoneNumber } = await request.json();
    
    console.log("phoneNumber", phoneNumber);
    
    // Forward request to the external API
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_PHARMACY_URL}/forgot-password`,
      { phone_number: phoneNumber },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept-Language': locale,
          ...(token && { Authorization: `Bearer ${token}` }),
        }
      }
    );
    
    console.log("response", response.data);
    
    // Return the API response
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const locale = getLocaleFromRequest(request);
    console.error('Forgot password error:', error.response?.data || error.message);
    
    // Return appropriate error response with translation
    const errorResponse = await createTranslatedErrorResponse(
      error, 
      error.response?.status || 500, 
      locale
    );
    
    return NextResponse.json({
      status: "error",
      message: errorResponse.error
    }, { status: error.response?.status || 500 });
  }
}