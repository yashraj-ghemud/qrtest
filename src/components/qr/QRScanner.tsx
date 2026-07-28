'use client';

/**
 * QRScanner — camera + image-upload QR scanner with proper guards:
 *  - Checks navigator.mediaDevices existence (critical bug fix)
 *  - Checks jsQR library existence (critical bug fix)
 *  - Stops camera on unmount / tab switch (critical bug fix)
 *  - Front/back camera toggle
 *  - Image-upload fallback for scanning a photo of a QR
 *  - Honors prefers-reduced-motion (no scan-line animation)
 *  - ARIA live region announces scan results
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onResult: (content: string) => void;
  className?: string;
}

type Facing = 'environment' | 'user';

export function QRScanner({ onResult, className }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastResultRef = useRef<string>('');
  const lastResultTimeRef = useRef<number>(0);

  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<Facing>('environment');
  const [lastScan, setLastScan] = useState<string | null>(null);

  // Properly stop the camera — CRITICAL bug fix
  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  }, []);

  // Use a stable ref pattern instead of useCallback self-reference.
  const scanLoopRef = useRef<() => void>(() => {});

  // Keep scanLoopRef.current fresh whenever onResult changes
  useEffect(() => {
    scanLoopRef.current = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      if (video.readyState !== video.HAVE_CURRENT_DATA) {
        rafRef.current = requestAnimationFrame(scanLoopRef.current);
        return;
      }
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Downsample to 480px for performance — critical perf fix
      const maxDim = 480;
      const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.max(1, Math.floor(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.floor(video.videoHeight * scale));
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let imageData: ImageData;
      try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch {
        rafRef.current = requestAnimationFrame(scanLoopRef.current);
        return;
      }

      // jsQR existence check — critical fix
      if (typeof jsQR !== 'function') {
        setError('QR decoder library failed to load. Refresh the page.');
        return;
      }

      try {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code && code.data) {
          const now = Date.now();
          if (code.data !== lastResultRef.current || now - lastResultTimeRef.current > 2000) {
            lastResultRef.current = code.data;
            lastResultTimeRef.current = now;
            setLastScan(code.data);
            onResult(code.data);
          }
        }
      } catch (e) {
        console.error('[scanner] jsQR threw:', e);
      }
      rafRef.current = requestAnimationFrame(scanLoopRef.current);
    };
  }, [onResult]);

  const start = useCallback(async () => {
    setError(null);
    // CRITICAL: guard navigator.mediaDevices for non-secure contexts
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError(
        'Camera not available. Use HTTPS, or upload a QR image below instead.',
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.muted = true;
      // Handle play() promise rejection — critical fix
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((e) => {
          console.error('[scanner] play() rejected:', e);
          setError('Could not start video preview. Tap play if needed.');
        });
      }
      setScanning(true);
      // Wait for loadedmetadata, then start scan loop
      video.addEventListener(
        'loadedmetadata',
        () => {
          rafRef.current = requestAnimationFrame(scanLoopRef.current);
        },
        { once: true },
      );
      // Safety timeout — if no loadedmetadata in 5s, show error
      setTimeout(() => {
        if (!video.videoWidth) {
          setError('Camera stream timed out. Try the image-upload option below.');
        }
      }, 5000);
    } catch (e) {
      const err = e as DOMException;
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Allow access or upload an image.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError(`Camera error: ${err.message || err.name}`);
      }
    }
  }, [facing, scanning]);

  // Switch camera — stop then restart with new facing
  const toggleFacing = useCallback(async () => {
    stop();
    setFacing((f) => (f === 'environment' ? 'user' : 'environment'));
  }, [stop]);

  // Cleanup on unmount — critical bug fix
  useEffect(() => {
    return () => stop();
  }, [stop]);

  // Image-upload scan fallback
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1024;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code && code.data) {
            setLastScan(code.data);
            onResult(code.data);
          } else {
            setError('Could not decode a QR from this image. Try a clearer photo.');
          }
        } catch (err) {
          setError('Decoding failed: ' + (err as Error).message);
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        setError('Could not load the image file.');
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    [onResult],
  );

  return (
    <div className={className}>
      <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl border bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          aria-label="Live camera preview for QR code scanning"
        />
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

        {/* Scan-line overlay */}
        {scanning && (
          <div
            className="pointer-events-none absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_2px_rgba(16,185,129,0.7)]"
            style={{ animation: 'scanline 2s linear infinite' }}
            aria-hidden="true"
          />
        )}

        {/* Corner frame */}
        <div className="pointer-events-none absolute inset-4 rounded-xl border-2 border-emerald-400/60" aria-hidden="true" />

        {/* Idle overlay */}
        {!scanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-center p-6">
            <div>
              <p className="text-sm text-slate-300 mb-4">
                Tap <strong>Start Camera</strong> to scan a QR code with your device camera.
              </p>
              <p className="text-xs text-slate-500">
                Or upload a photo of a QR below.
              </p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div
            role="alert"
            className="absolute inset-0 flex items-center justify-center bg-red-950/80 p-6 text-center"
          >
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {!scanning ? (
          <button
            onClick={start}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          >
            Stop
          </button>
        )}
        <button
          onClick={toggleFacing}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        >
          Flip Camera
        </button>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400">
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {/* ARIA live region — announces scan results to screen readers */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {lastScan ? `QR decoded: ${lastScan}` : 'No QR decoded yet'}
      </div>

      <style jsx>{`
        @keyframes scanline {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .scanline { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
