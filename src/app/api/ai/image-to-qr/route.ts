/**
 * AI #6 — OCR + AI Image-to-QR.
 *
 * Accepts an image (base64 data URL) of a printed/screen QR code,
 * asks the vision model to identify and decode the QR content.
 *
 * Uses google/gemma-4-31b-it (vision) via OpenRouter — user-authorized only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { chatVision } from '@/lib/ai/client';

const PROMPT = `You are looking at an image that may contain a QR code.

Your job:
1. Identify if a QR code is visible in the image.
2. If yes, transcribe the EXACT content the QR code encodes (URL, WiFi string, vCard, plain text, etc.). Do not paraphrase. Do not summarize. Do not add commentary.
3. If you cannot read the QR clearly, say exactly: "Could not decode QR" and explain why in one short sentence.
4. After the raw content, on a new line, write: "TYPE: <inferred-type>" where <inferred-type> is one of: url, text, wifi, vcard, email, sms, phone, geo, youtube, instagram, twitter, linkedin, whatsapp, bizcard, image, file, unknown.

Format your response as:

CONTENT: <exact-content>
TYPE: <inferred-type>

If no QR code is visible in the image, respond with:
CONTENT: NONE
TYPE: none`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      image: string; // base64 data URL
    };

    if (!body.image?.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'image must be a base64 data URL' },
        { status: 400 },
      );
    }

    // Cap image size — 5 MB
    if (body.image.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large. Max 5 MB.' },
        { status: 413 },
      );
    }

    const raw = await chatVision(PROMPT, body.image, {
      temperature: 0.1,
      maxTokens: 1000, // Increased for complete QR content extraction
    });

    // Parse the structured response
    const contentMatch = raw.match(/CONTENT:\s*([\s\S]+?)(?=\nTYPE:|$)/i);
    const typeMatch = raw.match(/TYPE:\s*(\S+)/i);
    const content = contentMatch ? contentMatch[1].trim() : '';
    const type = typeMatch ? typeMatch[1].trim().toLowerCase() : 'unknown';

    if (content === 'NONE' || !content) {
      return NextResponse.json({
        ok: false,
        content: null,
        type: 'none',
        raw,
        message: 'No QR code detected in the image.',
      });
    }

    return NextResponse.json({
      ok: true,
      content,
      type,
      raw,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[image-to-qr] error:', msg);
    return NextResponse.json(
      { error: msg, ok: false, message: 'Vision API call failed.' },
      { status: 500 },
    );
  }
}
