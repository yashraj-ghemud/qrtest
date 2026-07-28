/**
 * Tracking redirect — /r/[shortCode]
 *
 * For URL content: 301 redirect to the destination.
 * For non-URL content: render a small landing page that displays the content.
 * Either way: record the scan with UA / referer / approximate device type.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'unknown';
  const lower = ua.toLowerCase();
  if (/iphone|ipad|ipod/.test(lower)) return 'mobile';
  if (/android/.test(lower)) return 'mobile';
  if (/tablet/.test(lower)) return 'tablet';
  return 'desktop';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> },
) {
  const { shortCode } = await params;
  const qr = await db.trackedQR.findUnique({ where: { shortCode } });

  if (!qr) {
    return new NextResponse('QR not found', { status: 404 });
  }

  // Record the scan
  const ua = req.headers.get('user-agent');
  const referer = req.headers.get('referer');
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  try {
    await db.scan.create({
      data: {
        qrId: qr.id,
        userAgent: ua,
        referer,
        ip,
        deviceType: parseUserAgent(ua),
      },
    });
  } catch (e) {
    console.error('[scan] failed to record:', e);
  }

  // If it's a URL → redirect
  if (/^https?:\/\//i.test(qr.content)) {
    return NextResponse.redirect(qr.content, { status: 301 });
  }

  // Otherwise render a minimal landing page
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>QRcraft — Scanned Content</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; background:#0a0e1a; color:#f1f5f9; margin:0; padding:2rem; min-height:100vh; display:flex; align-items:center; justify-content:center; }
  .card { max-width:560px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:2rem; backdrop-filter:blur(20px); }
  h1 { font-size:1.1rem; margin:0 0 0.5rem; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
  pre { white-space:pre-wrap; word-break:break-word; background:rgba(0,0,0,0.3); padding:1rem; border-radius:12px; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:0.95rem; }
  .meta { margin-top:1rem; font-size:0.85rem; color:#64748b; }
</style>
</head>
<body>
  <div class="card">
    <h1>QR Content · ${qr.category}</h1>
    <pre>${qr.content.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] || c))}</pre>
    <div class="meta">Scanned via QRcraft · ${new Date().toLocaleString()}</div>
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
