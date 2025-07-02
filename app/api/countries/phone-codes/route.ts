import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/countries?fields=phone_code,iso2`, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': request.headers.get('Accept-Language') || 'en',
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data.data);
  } catch (error: any) {
    console.error('Country phone codes API route error:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: error.message || 'Failed to fetch country phone codes data' },
      { status: error.response?.status || 500 }
    );
  }
} 