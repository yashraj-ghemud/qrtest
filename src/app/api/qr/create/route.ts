/**
 * Create a tracked QR — returns a short URL that the user prints.
 * When scanned, /r/[shortCode] redirects to the original content (for URLs)
 * or shows a landing page (for non-URL content), and records the scan.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      content: string;
      category: string;
      label?: string;
    };
    if (!body.content) {
      return NextResponse.json({ error: 'content required' }, { status: 400 });
    }
    const qr = await db.trackedQR.create({
      data: {
        content: body.content,
        category: body.category,
        label: body.label || null,
      },
    });
    // The trackable URL is /r/<shortCode>
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const trackableUrl = baseUrl
      ? `${baseUrl}/r/${qr.shortCode}`
      : `/r/${qr.shortCode}`;
    return NextResponse.json({ qr, trackableUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
