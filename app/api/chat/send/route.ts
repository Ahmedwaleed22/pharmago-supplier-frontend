import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';
import { createTranslatedErrorResponse, getLocaleFromRequest } from '@/lib/api-i18n';

export async function POST(request: NextRequest) {
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
    
    // Get FormData from request
    const formData = await request.formData();
    
    // Create new FormData for backend - parse offer_data if it's a JSON string
    const backendFormData = new FormData();
    
    for (const [key, value] of formData.entries()) {
      if (key === 'offer_data' && typeof value === 'string') {
        // Parse JSON string and add as array structure that Laravel expects
        try {
          const offerData = JSON.parse(value);
          backendFormData.append('offer_data[quantity]', String(offerData.quantity));
          backendFormData.append('offer_data[offered_price]', String(offerData.offered_price));
          if (offerData.shipment_dimensions) {
            backendFormData.append('offer_data[shipment_dimensions]', JSON.stringify(offerData.shipment_dimensions));
          }
          if (offerData.notes) {
            backendFormData.append('offer_data[notes]', offerData.notes);
          }
        } catch (e) {
          // If parsing fails, append as-is
          backendFormData.append(key, value);
        }
      } else if (value instanceof File) {
        // Convert File to Buffer for form-data package
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        backendFormData.append(key, buffer, {
          filename: value.name,
          contentType: value.type,
        });
      } else {
        backendFormData.append(key, String(value));
      }
    }
    
    // Log FormData contents for debugging
    console.log('Chat send - FormData field names:', backendFormData.getHeaders());
    
    // Forward the request to the actual API with the auth token
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SUPPLIER_URL}/chat/send`,
      backendFormData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cookie': cookieHeader,
          'Accept-Language': locale,
          ...backendFormData.getHeaders(),
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data);
  } catch (error: any) {
    const locale = getLocaleFromRequest(request);
    console.error('Chat send API route error:', error);
    console.error('Error details:', error.response?.data);
    
    // Return appropriate error response with translation
    const errorResponse = await createTranslatedErrorResponse(
      error, 
      error.response?.status || 500, 
      locale
    );
    return NextResponse.json(errorResponse, { status: error.response?.status || 500 });
  }
}

