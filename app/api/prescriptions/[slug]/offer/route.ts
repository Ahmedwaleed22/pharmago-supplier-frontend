import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: prescriptionId } = await params;
    const body = await request.json();

    const price = body.price;
    const discount = body.discount;

    console.log(price, discount, prescriptionId);
    
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Extract the auth token from the cookie
    const tokenMatch = cookieHeader.match(/pharmacy_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Forward the request to the actual API with the auth token
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_PHARMACY_URL}/prescriptions/${prescriptionId}/offer`,
      {
        price,
        discount
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Cookie': cookieHeader
        }
      }
    );
    
    // Return the API response
    return NextResponse.json(response.data);
  } catch (error: any) {
    const { slug } = await params;
    console.error(`Prescription offer API route error for slug ${slug}:`, error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: error.message || 'Failed to send prescription offer' },
      { status: error.response?.status || 500 }
    );
  }
} 