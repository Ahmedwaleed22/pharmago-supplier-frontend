import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function PATCH(request: NextRequest) {
  try {
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/pharmacy_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Forward the request to mark all notifications as read
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_GLOBAL_URL}/notifications/mark-all-read`, 
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': cookieHeader
        }
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Mark all notifications as read API route error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to mark all notifications as read' },
      { status: error.response?.status || 500 }
    );
  }
} 