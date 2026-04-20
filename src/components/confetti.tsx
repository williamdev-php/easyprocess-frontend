"use client";

import { useEffect, useRef } from "react";

interface ConfettiPiece {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  gravity: number;
  drag: number;
}

const COLORS = [
  "#326586", "#24506E", "#F4E9D4", "#2563EB", "#F59E0B",
  "#059669", "#7C3AED", "#F472B6", "#34D399", "#FB923C",
  "#DC2626", "#FBBF24", "#4F46E5", "#0891B2",
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export default function Confetti({ duration = 4000 }: { duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let startTime = Date.now();

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Create confetti pieces from left and right edges
    const pieces: ConfettiPiece[] = [];
    const count = Math.min(Math.floor(window.innerWidth / 4), 200);

    for (let i = 0; i < count; i++) {
      const fromLeft = i % 2 === 0;
      pieces.push({
        x: fromLeft ? randomBetween(-20, 0) : randomBetween(canvas.width, canvas.width + 20),
        y: randomBetween(0, canvas.height * 0.7),
        w: randomBetween(6, 12),
        h: randomBetween(4, 8),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: fromLeft ? randomBetween(3, 12) : randomBetween(-12, -3),
        vy: randomBetween(-8, -2),
        rotation: randomBetween(0, Math.PI * 2),
        rotationSpeed: randomBetween(-0.15, 0.15),
        opacity: 1,
        gravity: randomBetween(0.08, 0.15),
        drag: randomBetween(0.97, 0.99),
      });
    }

    function animate() {
      const elapsed = Date.now() - startTime;
      const fadeStart = duration - 1000;

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const p of pieces) {
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (elapsed > fadeStart) {
          p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / 1000);
        }

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }

      if (elapsed < duration) {
        animationId = requestAnimationFrame(animate);
      }
    }

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [duration]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  );
}
