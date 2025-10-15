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
    let messages: string = "";
    const errorResponse = error.response.data;
    for (const [key, value] of Object.entries(errorResponse?.errors)) {
      messages += value + "\n";
    }
    console.log(messages);
    return NextResponse.json({
      "status": "error",
      "message": messages
    }, { status: error.response?.status || 500 });
  }
}