/**
 * QR rendering utilities — uses qrcode-generator for true vector SVG output,
 * with logo embedding, style templates, and PNG rasterization via canvas.
 */
import QRCode from 'qrcode-generator';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type QRStyleTemplate = 'classic' | 'rounded' | 'dots' | 'gradient';

export interface QRCustomization {
  foreground: string;
  background: string;
  errorCorrection: ErrorCorrectionLevel;
  size: number;
  margin: number;
  logoDataUrl?: string | null;
  logoSizeRatio?: number; // 0..0.3 — fraction of QR covered by logo
  template: QRStyleTemplate;
  gradientFrom?: string;
  gradientTo?: string;
}

export const DEFAULT_CUSTOMIZATION: QRCustomization = {
  foreground: '#0f172a',
  background: '#ffffff',
  errorCorrection: 'M',
  size: 512,
  margin: 4,
  logoDataUrl: null,
  logoSizeRatio: 0.18,
  template: 'classic',
};

export interface QRRenderResult {
  svg: string;
  pngDataUrl: string;
  /** qrcode-generator instance, in case the caller needs the module map */
  qr: QRCode;
}

/** Build a QRCode instance with safe error-correction default. */
export function buildQR(
  content: string,
  ec: ErrorCorrectionLevel = 'M',
): QRCode {
  // auto-detect best type number (0 = auto)
  return QRCode(0, ec);
}

/** Generate a true SVG (vector) representation of the QR code. */
export function renderQRSvg(
  content: string,
  opts: QRCustomization,
): { svg: string; qr: QRCode } {
  const qr = buildQR(content, opts.errorCorrection);
  qr.addData(content);
  qr.make();

  const count = qr.getModuleCount();
  const margin = opts.margin;
  const total = count + margin * 2;
  const cellSize = 1;
  const px = total * cellSize;
  const logoSize = opts.logoDataUrl
    ? Math.max(1, Math.floor(total * (opts.logoSizeRatio || 0.18)))
    : 0;

  // Build defs (gradient / logo image)
  const defs: string[] = [];
  let fillRef = opts.foreground;
  const gradId = 'qr-grad';
  if (opts.template === 'gradient' && opts.gradientFrom && opts.gradientTo) {
    defs.push(
      `<linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${opts.gradientFrom}"/>
        <stop offset="100%" stop-color="${opts.gradientTo}"/>
      </linearGradient>`,
    );
    fillRef = `url(#${gradId})`;
  }
  if (opts.logoDataUrl) {
    defs.push(
      `<image id="qr-logo" href="${opts.logoDataUrl}" x="${(px - logoSize) / 2}" y="${(px - logoSize) / 2}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`,
    );
  }

  // Build module rects
  const rects: string[] = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;
        if (opts.template === 'dots') {
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          rects.push(
            `<circle cx="${cx}" cy="${cy}" r="${cellSize * 0.42}" fill="${fillRef}"/>`,
          );
        } else if (opts.template === 'rounded') {
          rects.push(
            `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${cellSize * 0.3}" ry="${cellSize * 0.3}" fill="${fillRef}"/>`,
          );
        } else {
          rects.push(
            `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fillRef}"/>`,
          );
        }
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${px} ${px}" width="${opts.size}" height="${opts.size}" shape-rendering="crispEdges" role="img" aria-label="QR code">
  <rect width="${px}" height="${px}" fill="${opts.background}"/>
  <defs>${defs.join('\n    ')}</defs>
  <g>${rects.join('')}</g>
  ${opts.logoDataUrl ? `<use href="#qr-logo"/>` : ''}
</svg>`;

  return { svg, qr };
}

/** Rasterize the QR to a PNG data URL via a canvas (client-side). */
export async function renderQRPng(
  content: string,
  opts: QRCustomization,
): Promise<{ pngDataUrl: string; qr: QRCode }> {
  const { svg, qr } = renderQRSvg(content, opts);
  // Convert SVG -> PNG via an Image + canvas
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = opts.size;
      canvas.height = opts.size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, opts.size, opts.size);
      URL.revokeObjectURL(url);
      resolve({ pngDataUrl: canvas.toDataURL('image/png'), qr });
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to rasterize SVG: ' + String(e)));
    };
    img.src = url;
  });
}

/** Generate a small thumbnail (64×64 PNG data URL) for history. */
export async function renderQRThumbnail(
  content: string,
  opts: QRCustomization,
): Promise<string> {
  const thumbOpts: QRCustomization = {
    ...opts,
    size: 64,
    margin: 1,
    logoDataUrl: null,
  };
  const { pngDataUrl } = await renderQRPng(content, thumbOpts);
  return pngDataUrl;
}

/** Trigger a browser download for a data URL. */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** Trigger a browser download for an SVG string. */
export function downloadSvg(svg: string, filename: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Trigger a browser download for arbitrary binary blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
