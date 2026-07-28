/**
 * AI #7 — Analytics Insights.
 *
 * Generates natural-language insights from scan data.
 * Uses gpt-oss-120b (reasoning) for richer analysis.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chat, safeJsonParse } from '@/lib/ai/client';

const SYSTEM_PROMPT = `You are an analytics analyst for a QR code tracking dashboard. Given aggregated scan statistics, generate 3-5 concise, actionable insights.

Respond ONLY with JSON — no prose, no code fences — using this schema:
{
  "insights": [
    {
      "title": "short title (max 6 words)",
      "detail": "one sentence with specific numbers from the data",
      "severity": "positive | neutral | warning",
      "recommendation": "one short actionable suggestion"
    }
  ],
  "summary": "one paragraph summary of overall performance"
}

Rules:
- Use specific numbers and percentages from the data
- Highlight anomalies (sudden drops, unusual device splits, geographic concentration)
- If data is empty, return insights: [] and summary: "Not enough data yet."
- Keep each detail under 25 words
- Recommendations should be concrete (e.g. "Consider reprinting at 200% size") not generic`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      totalScans: number;
      uniqueQrs: number;
      last7Days: { date: string; count: number }[];
      deviceBreakdown: { device: string; count: number }[];
      topQrs: { label: string; category: string; scans: number }[];
    };

    const snapshot = {
      totalScans: body.totalScans,
      uniqueQrs: body.uniqueQrs,
      last7Days: body.last7Days,
      deviceBreakdown: body.deviceBreakdown,
      topQrs: body.topQrs.slice(0, 5),
    };

    const raw = await chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Scan analytics snapshot:\n${JSON.stringify(snapshot, null, 2)}\n\nGenerate insights.`,
        },
      ],
      { maxTokens: 1200, temperature: 0.5, jsonMode: true }, // Increased for detailed insights
    );

    const parsed = safeJsonParse(raw);
    if (!parsed) {
      return NextResponse.json({ error: 'Bad model output', raw }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[analytics-insights] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Helper export for server-side reuse
export { db };
