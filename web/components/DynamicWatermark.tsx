'use client';

import React, { useEffect, useRef, useState } from 'react';

interface WatermarkProps {
  domain: string;
  userIdentifier: string;
  sessionHash: string;
  opacity: number;
  intervalSeconds: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const DynamicWatermark: React.FC<WatermarkProps> = ({
  domain,
  userIdentifier,
  sessionHash,
  opacity,
  intervalSeconds,
  containerRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState({ top: '15%', left: '15%' });

  // 1. Periodically Shift Position to Prevent Cropping / Masking
  useEffect(() => {
    const shiftPosition = () => {
      const randomTop = Math.floor(Math.random() * 70 + 10); // 10% to 80%
      const randomLeft = Math.floor(Math.random() * 60 + 10); // 10% to 70%
      setPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
    };

    const interval = setInterval(shiftPosition, intervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [intervalSeconds]);

  // 2. Anti-Tamper MutationObserver (Restores element if user edits DOM in DevTools)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const observer = new MutationObserver(() => {
      if (!container.contains(canvas) || canvas.style.display === 'none' || canvas.style.visibility === 'hidden') {
        canvas.style.display = 'block';
        canvas.style.visibility = 'visible';
        canvas.style.opacity = `${opacity}`;
      }
    });

    observer.observe(container, { attributes: true, childList: true, subtree: true });
    return () => observer.disconnect();
  }, [containerRef, opacity]);

  // 3. Render High-Resolution Canvas Text Overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 360;
    canvas.height = 70;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '600 13px Inter, sans-serif';
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 4;

    const watermarkText = `${domain} • ${userIdentifier}`;
    const sessionText = `ID: ${sessionHash} • ${new Date().toLocaleTimeString()}`;

    ctx.fillText(watermarkText, 10, 25);
    ctx.fillText(sessionText, 10, 48);
  }, [domain, userIdentifier, sessionHash, opacity, position]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-50 transition-all duration-1000 ease-in-out select-none"
      style={{ top: position.top, left: position.left }}
    >
      <canvas ref={canvasRef} className="pointer-events-none" />
    </div>
  );
};
