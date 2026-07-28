'use client';

/**
 * QRCanvas — renders a QR code as SVG (true vector) with optional logo,
 * heartbeat animation, and glitch easter egg. Honors prefers-reduced-motion.
 *
 * The SVG is computed via useMemo (no setState-in-effect), so it stays in
 * sync with content/customization props without an extra render cycle.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  renderQRSvg,
  type QRCustomization,
} from '@/lib/qr/render';

interface QRCanvasProps {
  content: string;
  customization: QRCustomization;
  beat?: boolean;
  glitch?: boolean;
  className?: string;
}

export function QRCanvas({
  content,
  customization,
  beat = true,
  glitch = false,
  className,
}: QRCanvasProps) {
  const [glitchOn, setGlitchOn] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // SVG computed during render — no setState-in-effect
  const svg = useMemo(() => {
    if (!content) return '';
    try {
      return renderQRSvg(content, customization).svg;
    } catch (e) {
      console.error('QR render failed', e);
      return '';
    }
  }, [content, customization]);

  // Glitch easter egg — schedule via setTimeout (not setState in effect body)
  useEffect(() => {
    if (!glitch || !content || reduceMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    let inner: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 7000 + Math.random() * 4000;
      timer = setTimeout(() => {
        setGlitchOn(true);
        inner = setTimeout(() => {
          setGlitchOn(false);
          schedule();
        }, 200);
      }, delay);
    };
    schedule();
    return () => {
      clearTimeout(timer);
      clearTimeout(inner);
    };
  }, [glitch, content, reduceMotion]);

  // Heartbeat animation
  const beatStyle = useMemo<React.CSSProperties>(
    () =>
      beat && !reduceMotion
        ? { animation: 'qr-heartbeat 1.6s ease-in-out infinite' }
        : {},
    [beat, reduceMotion],
  );

  if (!content || !svg) return null;

  return (
    <div
      className={`relative inline-block ${className || ''}`}
      style={beatStyle}
    >
      <div
        aria-hidden={glitchOn}
        style={{
          filter: glitchOn
            ? 'hue-rotate(180deg) contrast(1.4) drop-shadow(2px 0 0 #ff0000) drop-shadow(-2px 0 0 #00ffff)'
            : 'none',
          transition: 'filter 80ms',
          background: customization.background,
          borderRadius: 12,
          padding: 8,
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <style jsx>{`
        @keyframes qr-heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
      `}</style>
    </div>
  );
}
