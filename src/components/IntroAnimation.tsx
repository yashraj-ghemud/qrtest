"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════════
   QRcraft — Cinematic Intro Animation
   "From Chaos to Code"

   All 8 scenes orchestrated via GSAP timeline.
   Particles rendered on <canvas> for performance.
   DOM text reveal via Framer-Motion-style CSS transitions.
   ═══════════════════════════════════════════════════════════════ */

// ─── Timing constants (seconds) — easy to tweak ─────────────────
const SCENE = {
  STATIC_START: 0,
  STATIC_END: 1.2,
  PULL_END: 2.8,
  CODE_FORM_END: 4.0,
  SCAN_END: 5.0,
  EXPLOSION_END: 5.6,
  REVEAL_END: 7.5,
  TAGLINE_END: 8.3,
  TRANSITION_END: 9.0,
} as const;

// ─── Particle / visual config ───────────────────────────────────
const PARTICLE_COUNT_DESKTOP = 250;
const PARTICLE_COUNT_MOBILE = 150;
const QR_GRID_SIZE = 21; // 21×21 like a real QR
const QR_CELL_SIZE = 8; // px per cell at base scale
const ACCENT_R = 0;
const ACCENT_G = 217;
const ACCENT_B = 255; // #00d9ff
const BRAND_TEXT = "YASHRAJ.DEV";
const TAGLINE_TEXT = "Smart QR Codes, Crafted.";
const STORAGE_KEY = "qrcraft_intro_seen";

// ─── Utility: generate a QR-code-like grid pattern ──────────────
function generateQRPattern(size: number): boolean[][] {
  const grid: boolean[][] = [];
  for (let y = 0; y < size; y++) {
    grid[y] = [];
    for (let x = 0; x < size; x++) {
      // 3 finder patterns (top-left, top-right, bottom-left)
      const inFinderTL = x < 7 && y < 7;
      const inFinderTR = x >= size - 7 && y < 7;
      const inFinderBL = x < 7 && y >= size - 7;

      if (inFinderTL || inFinderTR || inFinderBL) {
        // Determine local coordinates within the 7x7 finder
        const lx = inFinderTL ? x : inFinderTR ? x - (size - 7) : x;
        const ly = inFinderTL ? y : inFinderTR ? y : y - (size - 7);
        // Outer border (0,6) or inner 3x3 (2-4)
        const isOuter = lx === 0 || lx === 6 || ly === 0 || ly === 6;
        const isInner = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
        grid[y][x] = isOuter || isInner;
      } else {
        // Timing patterns — alternating every 2 in row 6 and col 6
        const isTimingRow = y === 6 && x > 7 && x < size - 8;
        const isTimingCol = x === 6 && y > 7 && y < size - 8;
        if (isTimingRow || isTimingCol) {
          grid[y][x] = (x + y) % 2 === 0;
        } else {
          // Random data modules
          grid[y][x] = Math.random() > 0.48;
        }
      }
    }
  }
  return grid;
}

// ─── Particle interface (flat color props for GSAP compatibility) ─
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  isBinary: boolean; // show "0" or "1" glyph
  binaryChar: "0" | "1";
  // Flat color channels — GSAP can animate these as numbers
  colorR: number;
  colorG: number;
  colorB: number;
  // Target positions for different scenes
  qrTargetX: number;
  qrTargetY: number;
  textTargetX: number;
  textTargetY: number;
  // For explosion
  explosionVx: number;
  explosionVy: number;
  // For spiral motion
  angle: number;
  radius: number;
  // State
  active: boolean;
}

// ─── Main component ─────────────────────────────────────────────
export default function IntroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const skipBtnRef = useRef<HTMLButtonElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);

  const [showIntro, setShowIntro] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const qrPatternRef = useRef<boolean[][]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const animFrameRef = useRef<number>(0);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const phaseRef = useRef<string>("static");
  const skipCallbackRef = useRef<(() => void) | null>(null);
  const isMobileRef = useRef(false);

  // ─── Check if we should show the intro ────────────────────────
  useEffect(() => {
    // Check reduced motion preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    // Check if already seen this session
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (seen) {
      return; // Don't show intro
    }
    setShowIntro(true);
  }, []);

  // ─── Skip intro handler ──────────────────────────────────────
  const skipIntro = useCallback(() => {
    if (skipCallbackRef.current) {
      skipCallbackRef.current();
    } else {
      // Fallback: just mark seen and hide
      sessionStorage.setItem(STORAGE_KEY, "true");
      setShowIntro(false);
    }
  }, []);

  // ─── Main animation setup ────────────────────────────────────
  useEffect(() => {
    if (!showIntro || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvasCtxRef.current = ctx;

    // Determine mobile
    isMobileRef.current = window.innerWidth < 768;
    const particleCount = isMobileRef.current
      ? PARTICLE_COUNT_MOBILE
      : PARTICLE_COUNT_DESKTOP;

    // Size canvas
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    // Generate QR pattern
    const qrPattern = generateQRPattern(QR_GRID_SIZE);
    qrPatternRef.current = qrPattern;

    // Calculate QR grid dimensions on screen
    const qrTotalCells = QR_GRID_SIZE;
    const qrScale = isMobileRef.current ? 0.6 : 1;
    const cellSize = QR_CELL_SIZE * qrScale;
    const qrPixelSize = qrTotalCells * cellSize;
    const qrOffsetX = (w - qrPixelSize) / 2;
    const qrOffsetY = (h - qrPixelSize) / 2;

    // Count "on" cells in QR
    const onCells: { x: number; y: number }[] = [];
    for (let row = 0; row < qrTotalCells; row++) {
      for (let col = 0; col < qrTotalCells; col++) {
        if (qrPattern[row][col]) {
          onCells.push({ x: col, y: row });
        }
      }
    }

    // ─── Measure text for scene 6 targets ──────────────────────
    const fontSize = isMobileRef.current ? w * 0.12 : w * 0.1;
    const textStr = BRAND_TEXT;
    const textMeasureCtx = document.createElement("canvas").getContext("2d")!;
    textMeasureCtx.font = `900 ${fontSize}px "Geist", "Inter", system-ui, sans-serif`;
    const textMetrics = textMeasureCtx.measureText(textStr);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    const textStartX = (w - textWidth) / 2;
    const textStartY = (h - textHeight) / 2 + textHeight * 0.35;

    // Get character positions for each character
    const charPositions: { x: number; y: number }[] = [];
    let charX = textStartX;
    for (let i = 0; i < textStr.length; i++) {
      const charWidth = textMeasureCtx.measureText(textStr[i]).width;
      charPositions.push({
        x: charX + charWidth / 2,
        y: textStartY,
      });
      charX += charWidth;
    }

    // ─── Initialize particles ──────────────────────────────────
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const isBinary = Math.random() < 0.3;
      const binaryChar = Math.random() < 0.5 ? "0" : "1";

      // QR target: assign to a random "on" cell
      const cell = onCells[i % onCells.length];
      const qrTargetX = qrOffsetX + cell.x * cellSize + cellSize / 2;
      const qrTargetY = qrOffsetY + cell.y * cellSize + cellSize / 2;

      // Text target: assign to a random character position with spread
      const charIdx = i % charPositions.length;
      const spread = fontSize * 0.3;
      const textTargetX =
        charPositions[charIdx].x + (Math.random() - 0.5) * spread;
      const textTargetY =
        charPositions[charIdx].y + (Math.random() - 0.5) * spread;

      // Explosion velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = 200 + Math.random() * 600;

      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: 0.15 + Math.random() * 0.15,
        size: isBinary ? 10 + Math.random() * 4 : 2 + Math.random() * 3,
        isBinary,
        binaryChar,
        colorR: 120,
        colorG: 120,
        colorB: 120,
        qrTargetX,
        qrTargetY,
        textTargetX,
        textTargetY,
        explosionVx: Math.cos(angle) * speed,
        explosionVy: Math.sin(angle) * speed,
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 100,
        active: true,
      });
    }
    particlesRef.current = particles;

    // ─── GSAP Timeline ─────────────────────────────────────────
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        // Mark as seen and hide
        sessionStorage.setItem(STORAGE_KEY, "true");
        // Small delay then fade out
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => setShowIntro(false),
        });
      },
    });
    timelineRef.current = tl;

    // Skip callback — jump to transition
    skipCallbackRef.current = () => {
      tl.progress(0.92); // Jump to near the end
      tl.play();
    };

    // ─── SCENE 1: "The Static" (0 – 1.2s) ─────────────────────
    phaseRef.current = "static";
    // Particles drift in the render loop — no GSAP tweens needed here.
    tl.to({}, { duration: SCENE.STATIC_END });

    // ─── SCENE 2: "The Pull" (1.2s – 2.8s) ────────────────────
    tl.add(() => {
      phaseRef.current = "pull";
    });

    // Animate each particle toward center with stagger
    particles.forEach((p, i) => {
      const delay = (i / particles.length) * 0.6; // stagger
      tl.to(
        p,
        {
          x: p.qrTargetX + (Math.random() - 0.5) * 20,
          y: p.qrTargetY + (Math.random() - 0.5) * 20,
          opacity: 1,
          colorR: ACCENT_R,
          colorG: ACCENT_G,
          colorB: ACCENT_B,
          duration: 1.2,
          ease: "power2.inOut",
        },
        SCENE.STATIC_END + delay
      );
    });

    // ─── SCENE 3: "The Code Forms" (2.8s – 4s) ────────────────
    tl.add(() => {
      phaseRef.current = "code";
    });

    // Snap particles to exact grid positions
    particles.forEach((p, i) => {
      const delay = (i / particles.length) * 0.8;
      tl.to(
        p,
        {
          x: p.qrTargetX,
          y: p.qrTargetY,
          opacity: 1,
          size: p.isBinary ? cellSize * 0.8 : cellSize * 0.6,
          duration: 0.3,
          ease: "back.out(2)",
        },
        SCENE.PULL_END + delay
      );
    });

    // ─── SCENE 4: "The Scan" (4s – 5s) ────────────────────────
    tl.add(() => {
      phaseRef.current = "scan";
      // Show the scan beam
      if (scanRef.current) {
        scanRef.current.style.display = "block";
        gsap.fromTo(
          scanRef.current,
          { top: qrOffsetY - 20 },
          {
            top: qrOffsetY + qrPixelSize + 20,
            duration: 1.0,
            ease: "none",
            onComplete: () => {
              if (scanRef.current) scanRef.current.style.display = "none";
            },
          }
        );
      }
      // Subtle camera zoom
      gsap.to(canvasRef.current, {
        scale: 1.05,
        duration: 1.0,
        ease: "power1.inOut",
      });
    });

    // ─── SCENE 5: "The Explosion" (5s – 5.6s) ─────────────────
    tl.add(() => {
      phaseRef.current = "explosion";
      // Flash
      if (flashRef.current) {
        flashRef.current.style.display = "block";
        gsap.fromTo(
          flashRef.current,
          { opacity: 0 },
          {
            opacity: 0.85,
            duration: 0.07,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              if (flashRef.current) {
                flashRef.current.style.display = "none";
              }
            },
          }
        );
      }
      // Reset zoom
      gsap.to(canvasRef.current, { scale: 1, duration: 0.3 });
    });

    // Burst particles outward
    particles.forEach((p, i) => {
      const delay = Math.random() * 0.15;
      tl.to(
        p,
        {
          x: p.qrTargetX + p.explosionVx * 0.6,
          y: p.qrTargetY + p.explosionVy * 0.6,
          opacity: 0.8,
          size: 2 + Math.random() * 3,
          colorR: 255,
          colorG: 255,
          colorB: 255,
          duration: 0.5,
          ease: "power3.out",
        },
        SCENE.SCAN_END + delay
      );
    });

    // ─── SCENE 6: "The Reveal" (5.6s – 7.5s) ─────────────────
    tl.add(() => {
      phaseRef.current = "reveal";
    });

    // Converge particles to text positions
    particles.forEach((p, i) => {
      const charIdx = i % charPositions.length;
      const isOuter = charIdx < 2 || charIdx >= charPositions.length - 2;
      const delay = isOuter ? 0.4 : 0.1;
      tl.to(
        p,
        {
          x: p.textTargetX,
          y: p.textTargetY,
          opacity: 0.9,
          colorR: ACCENT_R,
          colorG: ACCENT_G,
          colorB: ACCENT_B,
          size: 3 + Math.random() * 2,
          duration: 1.2,
          ease: "power2.inOut",
        },
        SCENE.EXPLOSION_END + delay + Math.random() * 0.3
      );
    });

    // Show the actual text underneath at the right moment
    tl.add(() => {
      if (textRef.current) {
        textRef.current.style.display = "flex";
        gsap.fromTo(
          textRef.current,
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1,
            scale: 1.05,
            duration: 0.5,
            ease: "back.out(1.7)",
            onComplete: () => {
              gsap.to(textRef.current, { scale: 1, duration: 0.3 });
            },
          }
        );
      }
    });

    // Camera zoom-out
    tl.to(
      containerRef.current,
      {
        scale: 1,
        duration: 1.5,
        ease: "power1.out",
      },
      SCENE.EXPLOSION_END
    );

    // ─── SCENE 7: "The Tagline" (7.5s – 8.3s) ────────────────
    tl.add(() => {
      phaseRef.current = "tagline";
      if (taglineRef.current) {
        taglineRef.current.style.display = "block";
        gsap.fromTo(
          taglineRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }
      if (dividerRef.current) {
        dividerRef.current.style.display = "block";
        gsap.fromTo(
          dividerRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, ease: "power2.out" }
        );
      }
    });

    // ─── SCENE 8: "The Transition Out" (8.3s – 9s) ────────────
    tl.add(() => {
      phaseRef.current = "transition";
    });

    // Zoom-through fade out
    tl.to(containerRef.current, {
      scale: 1.3,
      opacity: 0,
      duration: 0.7,
      ease: "power2.in",
      onComplete: () => {
        sessionStorage.setItem(STORAGE_KEY, "true");
        setShowIntro(false);
      },
    });

    // ─── Canvas render loop ────────────────────────────────────
    const render = () => {
      if (!canvasCtxRef.current) return;
      const c = canvasCtxRef.current;
      c.clearRect(0, 0, w, h);

      // Draw particles
      for (const p of particlesRef.current) {
        if (!p.active) continue;
        c.globalAlpha = p.opacity;
        const r = Math.round(p.colorR);
        const g = Math.round(p.colorG);
        const b = Math.round(p.colorB);

        if (p.isBinary && phaseRef.current === "static") {
          // Draw binary glyphs in scene 1
          c.font = `${p.size}px monospace`;
          c.fillStyle = `rgb(${r},${g},${b})`;
          c.fillText(p.binaryChar, p.x, p.y);
        } else {
          // Draw as circles with glow
          if (p.opacity > 0.5) {
            // Glow
            c.shadowColor = `rgba(${r},${g},${b},0.6)`;
            c.shadowBlur = p.size * 2;
          } else {
            c.shadowColor = "transparent";
            c.shadowBlur = 0;
          }
          c.beginPath();
          c.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          c.fillStyle = `rgb(${r},${g},${b})`;
          c.fill();
          c.shadowBlur = 0;
        }
      }

      // Draw QR code blocks in scene 3/4 (additional glow on top of particles)
      if (
        phaseRef.current === "code" ||
        phaseRef.current === "scan"
      ) {
        c.globalAlpha = 0.15;
        c.shadowColor = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.5)`;
        c.shadowBlur = 20;
        for (let row = 0; row < qrTotalCells; row++) {
          for (let col = 0; col < qrTotalCells; col++) {
            if (qrPattern[row][col]) {
              const cx = qrOffsetX + col * cellSize;
              const cy = qrOffsetY + row * cellSize;
              c.fillStyle = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.3)`;
              c.fillRect(cx, cy, cellSize, cellSize);
            }
          }
        }
        c.shadowBlur = 0;
      }

      c.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(render);
    };

    // Start render loop
    animFrameRef.current = requestAnimationFrame(render);

    // Play the timeline
    tl.play();

    // Show skip button after 1s
    const skipTimeout = setTimeout(() => {
      if (skipBtnRef.current) {
        skipBtnRef.current.style.display = "block";
        gsap.fromTo(
          skipBtnRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        );
      }
    }, 1000);

    // ─── Cleanup ───────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      tl.kill();
      clearTimeout(skipTimeout);
    };
  }, [showIntro, reducedMotion]);

  // ─── Reduced motion: simple fade-in ──────────────────────────
  if (showIntro && reducedMotion) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "introFadeOut 0.5s 0.5s forwards",
        }}
      >
        <div
          style={{
            fontSize: "clamp(2rem, 10vw, 8rem)",
            fontWeight: 900,
            background: "linear-gradient(135deg, #00d9ff, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: '"Geist", system-ui, sans-serif',
          }}
        >
          {BRAND_TEXT}
        </div>
        <style>{`
          @keyframes introFadeOut {
            to { opacity: 0; pointer-events: none; }
          }
        `}</style>
      </div>
    );
  }

  if (!showIntro) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        overflow: "hidden",
        transformOrigin: "center center",
      }}
    >
      {/* Canvas for particle system */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Flash overlay for explosion */}
      <div
        ref={flashRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "#fff",
          display: "none",
          pointerEvents: "none",
        }}
      />

      {/* Scan beam */}
      <div
        ref={scanRef}
        style={{
          position: "absolute",
          left: "10%",
          right: "10%",
          height: "4px",
          display: "none",
          background:
            "linear-gradient(90deg, transparent, rgba(0,217,255,0.3), rgba(255,255,255,0.9), rgba(0,217,255,0.3), transparent)",
          boxShadow:
            "0 0 20px rgba(0,217,255,0.8), 0 0 60px rgba(0,217,255,0.4), 0 0 100px rgba(0,217,255,0.2)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Brand text reveal (DOM layer) */}
      <div
        ref={textRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        <div
          style={{
            fontSize: "clamp(2.5rem, 10vw, 9rem)",
            fontWeight: 900,
            background: "linear-gradient(135deg, #00d9ff 0%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: '"Geist", system-ui, sans-serif',
            letterSpacing: "-0.02em",
            textShadow: "0 0 60px rgba(0,217,255,0.4)",
            filter: "drop-shadow(0 0 30px rgba(0,217,255,0.3))",
          }}
        >
          {BRAND_TEXT}
        </div>

        {/* Tagline */}
        <div
          ref={taglineRef}
          style={{
            display: "none",
            marginTop: "clamp(0.5rem, 2vw, 1.5rem)",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            ref={dividerRef}
            style={{
              display: "none",
              width: "clamp(60px, 20vw, 200px)",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgba(0,217,255,0.6), transparent)",
              transformOrigin: "center",
            }}
          />
          <div
            style={{
              fontSize: "clamp(0.7rem, 1.5vw, 1.1rem)",
              color: "rgba(255,255,255,0.6)",
              fontFamily: '"Geist", system-ui, sans-serif',
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {TAGLINE_TEXT}
          </div>
        </div>
      </div>

      {/* Skip Intro button */}
      <button
        ref={skipBtnRef}
        onClick={skipIntro}
        style={{
          position: "absolute",
          bottom: "2rem",
          right: "2rem",
          display: "none",
          padding: "0.5rem 1.2rem",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "6px",
          color: "rgba(255,255,255,0.5)",
          fontSize: "0.75rem",
          fontFamily: '"Geist", system-ui, sans-serif',
          cursor: "pointer",
          zIndex: 10,
          backdropFilter: "blur(8px)",
          transition: "all 0.2s ease",
          letterSpacing: "0.05em",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.8)";
          e.currentTarget.style.borderColor = "rgba(0,217,255,0.4)";
          e.currentTarget.style.background = "rgba(0,217,255,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        }}
      >
        SKIP INTRO
      </button>
    </div>
  );
}
