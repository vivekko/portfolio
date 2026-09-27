'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

// A full-screen chapter marker: the word starts oversized, filling the
// viewport, and settles to scale as the scroll moves through it.
export default function ChapterIntro({
  id,
  word,
  kicker,
}: {
  id?: string;
  word: string;
  kicker: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const scale = useTransform(scrollYProgress, [0, 0.85], [3.4, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.12], [0.3, 1]);
  const kickerOpacity = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);
  const kickerY = useTransform(scrollYProgress, [0.55, 0.85], [16, 0]);

  if (reduced) {
    return (
      <div id={id} className="flex flex-col items-center gap-4 py-32">
        <h2 className="type-display text-center text-[clamp(3rem,9vw,8rem)] text-bone">
          {word}
        </h2>
        <p className="font-mono text-xs text-mist">{kicker}</p>
      </div>
    );
  }

  return (
    <div ref={ref} id={id} className="relative z-10 h-[200vh] bg-ink">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <motion.h2
          style={{ scale, opacity }}
          className="type-display whitespace-nowrap text-center text-[clamp(3rem,9vw,8rem)] text-bone"
        >
          {word}
        </motion.h2>
        <motion.p
          style={{ opacity: kickerOpacity, y: kickerY }}
          className="mt-6 font-mono text-xs text-mist"
        >
          {kicker}
        </motion.p>
      </div>
    </div>
  );
}
