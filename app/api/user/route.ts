import { NextRequest, NextResponse } from "next/server";
import { getAuthHeader } from "@/lib/api";
import axios from "axios";

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/pharmacy_auth_token=([^;]+)/);
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
  const response = await axios.get(`${process.env.NEXT_PUBLIC_PHARMACY_URL}/user`, { headers: { Authorization: `Bearer ${token}` } });

  return NextResponse.json(response.data);
}