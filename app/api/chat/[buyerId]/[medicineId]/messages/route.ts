import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { createTranslatedErrorResponse, getLocaleFromRequest } from '@/lib/api-i18n';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ buyerId: string; medicineId: string }> }
) {
  try {
    const locale = getLocaleFromRequest(request);
    
    // Await params before accessing properties
    const resolvedParams = await params;
    
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
      `${process.env.NEXT_PUBLIC_SUPPLIER_URL}/chat/${resolvedParams.buyerId}/${resolvedParams.medicineId}/messages`, 
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
    
    // Mark all unread messages as read when fetching messages for the conversation
    // Only mark as read if this is the first page (page 1) to avoid spamming
    if (page === '1') {
      try {
        const markReadResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_SUPPLIER_URL}/chat/mark-read`,
          {
            buyer_id: resolvedParams.buyerId,
            medicine_id: resolvedParams.medicineId,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cookie': cookieHeader,
              'Accept-Language': locale
            }
          }
        );
        
        // Update messages in the response to reflect they're now read
        if (response.data?.data?.messages && Array.isArray(response.data.data.messages)) {
          response.data.data.messages = response.data.data.messages.map((msg: any) => ({
            ...msg,
            is_read: true,
            read_at: msg.read_at || new Date().toISOString()
          }));
        }
        
        // Note: The frontend will reload conversations after loading messages
        // to get the updated unread counts from the backend
      } catch (markReadErr: any) {
        // Silently fail - messages are still returned
        // Only log if it's not a 404 or expected error
        if (markReadErr.response?.status && markReadErr.response.status !== 404) {
          console.error('[Messages Route] Error marking messages as read:', markReadErr.response?.status, markReadErr.message);
        }
      }
    }
    
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

