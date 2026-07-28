/**
 * AI #2 — Smart QR Design suggestions.
 *
 * Takes the QR content + category and asks the LLM to suggest:
 *  - A creative design direction (palette + template)
 *  - A human-readable rationale
 *
 * Uses gpt-oss-120b (reasoning) for higher-quality suggestions.
 */
import { NextRequest, NextResponse } from 'next/server';
import { chat, safeJsonParse } from '@/lib/ai/client';

const SYSTEM_PROMPT = `You are a brand designer inside a QR code generator app. Given a QR's category and a snippet of its content, suggest a creative visual design that fits the destination's vibe.

Respond ONLY with a JSON object — no prose, no code fences — using this exact schema:

{
  "template": "classic" | "rounded" | "dots" | "gradient",
  "foreground": "#rrggbb",
  "background": "#rrggbb",
  "gradientFrom": "#rrggbb",
  "gradientTo": "#rrggbb",
  "rationale": "one short sentence explaining the choice",
  "mood": "calm | energetic | professional | playful | luxurious | minimal"
}

Rules:
- Foreground + background MUST have a WCAG-AA contrast ratio of at least 4.5:1 for normal text. Always test mentally: a black QR on a dark background is unusable.
- For URL/brand categories (instagram, twitter, linkedin, youtube), you may use brand colors but keep them readable.
- For WiFi, prefer calm / professional palette since it's often printed and taped to a wall.
- For vCard / bizcard, prefer professional palettes (deep navy, charcoal, forest green, etc.).
- For event/playful categories, you may use gradient.
- Never suggest a pure-white foreground on a pure-white background.
- Keep the rationale under 15 words.
- Always include gradientFrom and gradientTo fields even if template is not gradient (use sensible fallback colors).`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      category: string;
      content: string;
    };

    if (!body.category) {
      return NextResponse.json(
        { error: 'category is required' },
        { status: 400 },
      );
    }

    // Truncate content for privacy + token budget
    const snippet = (body.content || '').slice(0, 200);

    const raw = await chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Category: ${body.category}\nContent snippet: ${snippet}\n\nSuggest a design.`,
        },
      ],
      { maxTokens: 800, temperature: 0.8, jsonMode: true }, // Increased for design details
    );

    const parsed = safeJsonParse(raw);
    if (!parsed || typeof parsed !== 'object') {
      console.error('[design] Model returned non-JSON:', raw);

      // Return a sensible default instead of 502
      return NextResponse.json({
        template: 'classic',
        foreground: '#000000',
        background: '#FFFFFF',
        gradientFrom: '#000000',
        gradientTo: '#333333',
        rationale: 'Classic black and white for maximum readability',
        mood: 'professional',
        _warning: 'AI returned non-JSON, using safe defaults',
        _raw: raw.substring(0, 200),
      });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[design] error:', msg);

    // Return safe defaults on error
    return NextResponse.json({
      template: 'classic',
      foreground: '#000000',
      background: '#FFFFFF',
      gradientFrom: '#000000',
      gradientTo: '#333333',
      rationale: 'Default design due to AI service error',
      mood: 'minimal',
      _error: msg,
    }, { status: 200 }); // Return 200 instead of 500 so UI doesn't break
  }
}
