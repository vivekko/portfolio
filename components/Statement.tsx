'use client';

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

const STATEMENT =
  'Three years building backend systems for fintech, logistics, and compliance — the kind where a dropped message is a lost sale and a slow query is a support ticket. My work lives in Java and Spring Boot, moves through Kafka and Kinesis, and ships on Kubernetes. I care most about the unglamorous parts: idempotency, backpressure, auth that actually holds, and migrations that land without anyone noticing.';

const PROOF = [
  {
    value: '+55%',
    unit: 'sales conversion',
    detail: 'FMCSA carrier verification integration at Trux',
  },
  {
    value: '20×',
    unit: 'faster builds',
    detail: 'Maven to Gradle migration on Java 17 at Turtlemint',
  },
  {
    value: '30%',
    unit: 'operations lift',
    detail: 'GPS geofence automation for driver compliance',
  },
  {
    value: '10 services',
    unit: 'zero downtime',
    detail: 'Java 8 → 17 migration across production at Smarsh',
  },
];

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}{' '}
    </motion.span>
  );
}

export default function Statement() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ['start 0.85', 'end 0.45'],
  });

  const words = STATEMENT.split(' ');

  return (
    <section className="relative z-10 border-t border-line bg-ink" id="about">
      <div className="mx-auto max-w-6xl px-6 py-28 lg:px-8 lg:py-36">
        <p
          ref={textRef}
          className="type-subdisplay max-w-4xl text-[clamp(1.5rem,3.2vw,2.6rem)] text-bone"
        >
          {words.map((word, i) => (
            <Word
              key={i}
              progress={scrollYProgress}
              range={[i / words.length, Math.min(1, (i + 6) / words.length)]}
            >
              {word}
            </Word>
          ))}
        </p>

        {/* proof, kept as a ledger rather than stat tiles */}
        <div className="mt-24 border-t border-line">
          {PROOF.map((row) => (
            <div
              key={row.value}
              className="group grid grid-cols-1 gap-2 border-b border-line py-6 transition-colors duration-300 hover:bg-panel/60 sm:grid-cols-[10rem_14rem_1fr] sm:items-baseline sm:gap-6"
            >
              <span className="font-mono text-2xl text-signal">{row.value}</span>
              <span className="text-sm text-bone">{row.unit}</span>
              <span className="text-sm text-mist">{row.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
