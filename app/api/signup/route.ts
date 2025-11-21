import { createTranslatedErrorResponse } from "@/lib/api-i18n";

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getLocaleFromRequest } from "@/lib/api-i18n";

export async function POST(request: NextRequest) {
  try {
    const locale = getLocaleFromRequest(request);
    
    // Get the form data from the request
    const formData = await request.formData();
    
    console.log(formData);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SUPPLIER_URL}/register`,
      formData,
      {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept-Language': locale,
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    const locale = getLocaleFromRequest(request);
    console.error('Signup error:', error.response.data);
    
    // Return appropriate error response with translation
    // const errorResponse = await createTranslatedErrorResponse(
    //   error, 
    //   error.response?.status || 500, 
    //   locale
    // );

    const errorResponse = error.response?.data || {};

    let messages = "";

    // Prefer structured validation errors if present
    if (errorResponse?.errors && typeof errorResponse.errors === "object") {
      for (const [, value] of Object.entries(errorResponse.errors)) {
        // Laravel often returns arrays of messages per field
        if (Array.isArray(value)) {
          messages += value.join("\n") + "\n";
        } else if (value) {
          messages += String(value) + "\n";
        }
      }
      messages = messages.trim();
    }

    // Fallback to top-level message when there is no errors object
    if (!messages && errorResponse?.message) {
      messages = String(errorResponse.message);
    }

    // Final generic fallback
    if (!messages) {
      messages = "An error occurred while processing your request.";
    }

    console.log("Signup aggregated error message:", messages);

    return NextResponse.json(
      {
        status: "error",
        message: messages,
      },
      { status: error.response?.status || 500 }
    );
  }
}