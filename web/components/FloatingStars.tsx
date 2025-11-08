'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface FloatingStarsProps {
  count?: number;
}

// Seed-based random number generator for stable values
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function FloatingStars({ count = 20 }: FloatingStarsProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: seededRandom(i * 4 + 1) * 20 + 10,
        left: seededRandom(i * 4 + 2) * 100,
        top: seededRandom(i * 4 + 3) * 100,
        duration: seededRandom(i * 4 + 4) * 3 + 2,
        delay: seededRandom(i * 4 + 5) * 2,
      })),
    [count]
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 51 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M25.5 0L31.3344 18.1459H50.3647L35.0151 29.3541L40.8495 47.5L25.5 36.2918L10.1505 47.5L15.9849 29.3541L0.635258 18.1459H19.6656L25.5 0Z"
              fill="url(#gradient)"
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="51" y2="48">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
