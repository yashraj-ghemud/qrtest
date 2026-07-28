/**
 * Fetch analytics for the dashboard.
 *
 * GET /api/analytics — returns aggregated stats across all tracked QRs.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function parseUserAgent(ua: string | null): string {
  if (!ua) return 'unknown';
  const lower = ua.toLowerCase();
  if (/iphone|ipad|ipod/.test(lower)) return 'mobile (iOS)';
  if (/android/.test(lower)) return 'mobile (Android)';
  if (/tablet/.test(lower)) return 'tablet';
  if (/windows/.test(lower)) return 'desktop (Windows)';
  if (/macintosh|mac os/.test(lower)) return 'desktop (Mac)';
  if (/linux/.test(lower)) return 'desktop (Linux)';
  return 'other';
}

export async function GET() {
  const totalScans = await db.scan.count();
  const uniqueQrs = await db.trackedQR.count();

  // Last 7 days — group by day
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentScans = await db.scan.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true, userAgent: true, qrId: true },
  });

  const dayMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, 0);
  }
  for (const s of recentScans) {
    const key = s.createdAt.toISOString().slice(0, 10);
    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) || 0) + 1);
  }
  const last7Days = Array.from(dayMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  // Device breakdown
  const deviceMap = new Map<string, number>();
  for (const s of recentScans) {
    const d = parseUserAgent(s.userAgent);
    deviceMap.set(d, (deviceMap.get(d) || 0) + 1);
  }
  const deviceBreakdown = Array.from(deviceMap.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  // Top QRs
  const topQrs = await db.trackedQR.findMany({
    include: { _count: { select: { scans: true } } },
    orderBy: { scans: { _count: 'desc' } },
    take: 10,
  });
  const topQrsData = topQrs.map((q) => ({
    id: q.id,
    shortCode: q.shortCode,
    label: q.label || q.content.slice(0, 40),
    category: q.category,
    scans: q._count.scans,
    createdAt: q.createdAt,
  }));

  return NextResponse.json({
    totalScans,
    uniqueQrs,
    last7Days,
    deviceBreakdown,
    topQrs: topQrsData,
  });
}
