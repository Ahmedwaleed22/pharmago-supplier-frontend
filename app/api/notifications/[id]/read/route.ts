import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/supplier_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const notificationId = (await params).id;
    
    // Forward the request to mark the notification as read
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_GLOBAL_URL}/notifications/${notificationId}/mark-read`, 
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
    console.error('Mark notification as read API route error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to mark notification as read' },
      { status: error.response?.status || 500 }
    );
  }
} 