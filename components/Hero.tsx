'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import NodeField from './NodeField';
import Terminal from './Terminal';

const EASE = [0.16, 1, 0.3, 1] as const;

function RevealLine({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className={`block ${className ?? ''}`}
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.25]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div ref={ref} id="top" className="relative flex h-screen flex-col overflow-hidden">
      {/* live topology behind everything */}
      <div className="absolute inset-0">
        <NodeField />
      </div>
      {/* keep type legible over the field */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="pointer-events-none relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 content-end gap-12 px-6 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:px-8"
      >
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mb-6 hidden font-mono text-xs text-mist [@media(pointer:fine)]:block"
          >
            live node field — the cursor is a probe
          </motion.p>

          <h1 className="type-display text-[clamp(3.6rem,9vw,7.5rem)] text-bone">
            <RevealLine delay={0.15}>VIVEK</RevealLine>
            <RevealLine delay={0.27}>OJHA</RevealLine>
          </h1>

          <div className="mt-8 max-w-xl">
            <RevealLine delay={0.45} className="text-lg leading-relaxed text-mist">
              Software Engineer II at Smarsh. I design the systems nobody sees
              and everybody depends on — event streams, microservices, and the
              plumbing that keeps them honest at scale.
            </RevealLine>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="pointer-events-auto mt-10 flex items-center gap-8"
          >
            <a
              href="https://github.com/vivekko"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="open"
              className="link-sweep text-sm text-bone"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/vivek-ojha-a540a9172/"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="open"
              className="link-sweep text-sm text-bone"
            >
              LinkedIn
            </a>
            <a
              href="mailto:vivekojha961@gmail.com"
              data-cursor="write"
              className="link-sweep text-sm text-bone"
            >
              Email
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto hidden md:block"
        >
          <Terminal />
        </motion.div>
      </motion.div>

      {/* scroll hint: a thin falling line, not the mouse-pill cliché */}
      <motion.div
        style={{ opacity: hintOpacity }}
        className="absolute bottom-0 right-8 z-10 hidden h-24 w-px overflow-hidden bg-line sm:block lg:right-12"
      >
        <motion.div
          className="h-8 w-px bg-signal"
          animate={{ y: [-32, 96] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
        />
      </motion.div>
    </div>
  );
}
