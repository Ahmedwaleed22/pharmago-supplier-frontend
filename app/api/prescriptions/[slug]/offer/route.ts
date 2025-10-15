import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Helper function to check if offer has expired (24 hours)
function isOfferExpired(createdAt: string): boolean {
  if (!createdAt) return true;
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  
  return diffInHours > 24;
}

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
    const tokenMatch = cookieHeader.match(/supplier_auth_token=([^;]+)/);
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, fetch the prescription to check its creation date
    try {
      const prescriptionResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_SUPPLIER_URL}/prescriptions/${prescriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Cookie': cookieHeader
          }
        }
      );

      const prescription = prescriptionResponse.data.data;
      
      // Check if offer period has expired
      if (isOfferExpired(prescription.created_at)) {
        return NextResponse.json(
          { error: 'Offer period has expired. You can no longer make offers for prescriptions older than 24 hours.' },
          { status: 400 }
        );
      }
    } catch (fetchError: any) {
      console.error('Error fetching prescription for validation:', fetchError);
      return NextResponse.json(
        { error: 'Failed to validate prescription' },
        { status: 500 }
      );
    }

    // Forward the request to the actual API with the auth token
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SUPPLIER_URL}/prescriptions/${prescriptionId}/offer`,
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