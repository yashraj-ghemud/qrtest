/**
 * Batch QR generation — POST a CSV with content + label columns,
 * receive a ZIP of SVG QR codes (one per row).
 *
 * CSV format (header row required):
 *   content,label
 *   "https://example.com","Site 1"
 *   "https://example.org","Site 2"
 *
 * Query params:
 *   ?ec=L|M|Q|H   — error correction (default M)
 *   ?size=512     — PNG size in pixels (default 512, max 2048)
 *
 * Returns: application/zip stream
 */
import { NextRequest, NextResponse } from 'next/server';
import { ZipArchive } from 'archiver';
import Papa from 'papaparse';
import QRCode from 'qrcode-generator';
import { Writable } from 'stream';

interface BatchRow {
  content: string;
  label?: string;
}

function parseCSV(csv: string): BatchRow[] {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });
  if (parsed.errors.length > 0) {
    console.warn('[batch] CSV parse warnings:', parsed.errors.slice(0, 3));
  }
  return (parsed.data || [])
    .filter((r) => r && (r.content || r.Content || r.url || r.URL))
    .map((r) => ({
      content: String(r.content || r.Content || r.url || r.URL || '').trim(),
      label: r.label || r.Label || r.name || r.Name || undefined,
    }))
    .filter((r) => r.content.length > 0);
}

function renderQRSvgString(
  content: string,
  ec: 'L' | 'M' | 'Q' | 'H',
  size: number,
  fg = '#0f172a',
  bg = '#ffffff',
): string {
  const qr = QRCode(0, ec);
  qr.addData(content);
  qr.make();
  const count = qr.getModuleCount();
  const margin = 4;
  const total = count + margin * 2;
  const cell = size / total;
  const rects: string[] = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        const x = (c + margin) * cell;
        const y = (r + margin) * cell;
        rects.push(
          `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="${fg}"/>`,
        );
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${bg}"/>${rects.join('')}</svg>`;
}

function sanitizeFilename(s: string): string {
  return s.replace(/[^a-zA-Z0-9-_]+/g, '_').slice(0, 60);
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const ec = (url.searchParams.get('ec') || 'M').toUpperCase() as
      | 'L' | 'M' | 'Q' | 'H';
    const size = Math.min(
      2048,
      Math.max(128, Number(url.searchParams.get('size') || '512')),
    );

    const bodyText = await req.text();
    if (!bodyText.trim()) {
      return NextResponse.json(
        { error: 'Empty body. Send CSV text.' },
        { status: 400 },
      );
    }
    const rows = parseCSV(bodyText);
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid rows found. CSV must have a "content" column.' },
        { status: 400 },
      );
    }
    if (rows.length > 500) {
      return NextResponse.json(
        { error: 'Too many rows. Max 500 per batch.' },
        { status: 413 },
      );
    }

    const archive = new ZipArchive({ zlib: { level: 6 } });
    const chunks: Uint8Array[] = [];
    const writable = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        chunks.push(new Uint8Array(chunk));
        callback();
      },
    });
    archive.pipe(writable);

    const manifestLines = ['index,label,content'];
    rows.forEach((r, i) => {
      const label = r.label || `qr-${i + 1}`;
      const safe = sanitizeFilename(label);
      const svg = renderQRSvgString(r.content, ec, size);
      archive.append(svg, { name: `${String(i + 1).padStart(3, '0')}-${safe}.svg` });
      const escapedLabel = label.replace(/"/g, '""');
      const escapedContent = r.content.replace(/"/g, '""');
      manifestLines.push(`${i + 1},"${escapedLabel}","${escapedContent}"`);
    });
    archive.append(manifestLines.join('\n'), { name: '_manifest.csv' });

    await archive.finalize();

    const blob = new Blob(chunks as BlobPart[], { type: 'application/zip' });
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="qrcraft-batch.zip"',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[batch] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
