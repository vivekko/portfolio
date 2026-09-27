'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import VisualizerTabs from './VisualizerTabs';

// The section arrives as a framed screen and expands to full bleed
// as it scrolls into view.
export default function ModelsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 0.15'],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ['inset(10% 7% 10% 7% round 20px)', 'inset(0% 0% 0% 0% round 0px)']
  );
  const innerScale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);

  return (
    <section id="models" className="relative z-10 bg-ink">
      <motion.div
        ref={ref}
        style={reduced ? undefined : { clipPath }}
        className="bg-panel"
      >
        <motion.div
          style={reduced ? undefined : { scale: innerScale }}
          className="mx-auto max-w-6xl px-6 py-28 lg:px-8"
        >
          <h2 className="type-display text-[clamp(2.4rem,6vw,4.5rem)] text-bone">
            Working models
          </h2>
          <p className="mb-14 mt-4 max-w-xl text-base text-mist">
            Interactive simulations of the systems I build — run them, break
            them, watch them recover.
          </p>
          <VisualizerTabs />
        </motion.div>
      </motion.div>
    </section>
  );
}
