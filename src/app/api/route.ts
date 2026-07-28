import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'QRcraft API is running',
    version: '0.2.1',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
}