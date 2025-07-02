import { NextRequest, NextResponse } from "next/server";

const NEXT_PUBLIC_PHARMACY_URL = process.env.NEXT_PUBLIC_PHARMACY_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, password_confirmation } = body;

    if (!token || !password || !password_confirmation) {
      return NextResponse.json(
        { error: "Token, password, and password confirmation are required" },
        { status: 400 }
      );
    }

    // Get Accept-Language header from the request
    const acceptLanguage = request.headers.get('accept-language') || 'en';

    // Forward the request to the backend API
    const response = await fetch(`${NEXT_PUBLIC_PHARMACY_URL}/reset-password-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Accept-Language": acceptLanguage,
      },
      body: JSON.stringify({
        token,
        password,
        password_confirmation,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.message || "Password reset failed",
          details: data
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Password has been reset successfully",
      data
    });

  } catch (error) {
    console.error("Reset password token API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 