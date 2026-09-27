'use client';

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  MotionValue,
} from 'framer-motion';
import { useRef } from 'react';

const PATH =
  'M 90 170 C 170 170 220 110 300 110 C 380 110 430 220 510 220 C 590 220 640 110 720 110 C 800 110 850 220 930 220 C 1010 220 1070 150 1150 150';

const STAGES = [
  { x: 90, y: 170, label: 'editor' },
  { x: 300, y: 110, label: 'git push' },
  { x: 510, y: 220, label: 'ci: test + build' },
  { x: 720, y: 110, label: 'registry' },
  { x: 930, y: 220, label: 'kubernetes' },
  { x: 1150, y: 150, label: 'production' },
];

const BONE = 'rgba(232,228,215,0.75)';
const MIST = '#8CA3A0';
const AMBER = '#E3B04B';

function Stage({
  index,
  progress,
  children,
  animate,
}: {
  index: number;
  progress: MotionValue<number>;
  children: React.ReactNode;
  animate: boolean;
}) {
  const start = 0.08 + index * 0.15;
  const opacity = useTransform(progress, [start, start + 0.1], [0, 1]);
  const { x, y, label } = STAGES[index];
  return (
    <motion.g
      transform={`translate(${x} ${y})`}
      style={animate ? { opacity } : undefined}
    >
      {children}
      <text
        y={48}
        textAnchor="middle"
        fontSize={12}
        fill={MIST}
        fontFamily="var(--font-geist-mono), monospace"
      >
        {label}
      </text>
    </motion.g>
  );
}

// The route a change takes to production, drawn as one wire. The wire
// draws itself on scroll; commits ride it continuously after that.
export default function Pipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.2'],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const animate = !reduced;

  return (
    <section className="relative z-10 bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-28 lg:px-8" ref={ref}>
        <h2 className="type-display text-[clamp(2.4rem,6vw,4.5rem)] text-bone">
          Editor to production
        </h2>
        <p className="mt-4 max-w-xl text-base text-mist">
          Every change rides the same wire: committed, tested, containerized,
          rolled out. No hand-deploys, no surprises.
        </p>

        <div className="mt-16 overflow-x-auto pb-4">
          <svg
            viewBox="0 0 1240 300"
            className="min-w-[900px]"
            role="img"
            aria-label="Deployment pipeline: editor, git push, CI, registry, Kubernetes, production"
          >
            {/* the wire */}
            <motion.path
              d={PATH}
              fill="none"
              stroke="rgba(232,228,215,0.22)"
              strokeWidth={1.4}
              style={animate ? { pathLength } : undefined}
            />
            <path id="pipe-route" d={PATH} fill="none" stroke="none" />

            {/* editor: a window with code lines and a blinking caret */}
            <Stage index={0} progress={scrollYProgress} animate={animate}>
              <rect x={-26} y={-20} width={52} height={40} rx={5} fill="#0D181B" stroke={BONE} strokeWidth={1.5} />
              <circle cx={-18} cy={-13} r={1.5} fill={MIST} />
              <circle cx={-12} cy={-13} r={1.5} fill={MIST} />
              <line x1={-18} y1={-4} x2={4} y2={-4} stroke={MIST} strokeWidth={2} strokeLinecap="round" />
              <line x1={-18} y1={3} x2={14} y2={3} stroke={AMBER} strokeWidth={2} strokeLinecap="round" />
              <line x1={-18} y1={10} x2={-2} y2={10} stroke={MIST} strokeWidth={2} strokeLinecap="round" />
              <rect x={2} y={7} width={5} height={6} fill={AMBER}>
                {animate && (
                  <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="indefinite" />
                )}
              </rect>
            </Stage>

            {/* git: a branch merging back */}
            <Stage index={1} progress={scrollYProgress} animate={animate}>
              <line x1={-8} y1={14} x2={-8} y2={-14} stroke={BONE} strokeWidth={1.5} />
              <path d="M -8 6 C -8 -4 12 -2 12 -12" fill="none" stroke={BONE} strokeWidth={1.5} />
              <circle cx={-8} cy={14} r={4} fill="#0D181B" stroke={BONE} strokeWidth={1.5} />
              <circle cx={-8} cy={-14} r={4} fill="#0D181B" stroke={BONE} strokeWidth={1.5} />
              <circle cx={12} cy={-12} r={4} fill="#0D181B" stroke={AMBER} strokeWidth={1.5} />
            </Stage>

            {/* ci: a spinning test loop around a check */}
            <Stage index={2} progress={scrollYProgress} animate={animate}>
              <g>
                <circle r={17} fill="none" stroke={BONE} strokeWidth={1.5} strokeDasharray="6 5" />
                {animate && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur="7s"
                    repeatCount="indefinite"
                  />
                )}
              </g>
              <path d="M -7 0 L -2 6 L 8 -6" fill="none" stroke={AMBER} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Stage>

            {/* registry: stacked image layers */}
            <Stage index={3} progress={scrollYProgress} animate={animate}>
              <rect x={-20} y={-18} width={40} height={10} rx={2.5} fill="#0D181B" stroke={BONE} strokeWidth={1.5} />
              <rect x={-20} y={-5} width={40} height={10} rx={2.5} fill="#0D181B" stroke={BONE} strokeWidth={1.5} />
              <rect x={-20} y={8} width={40} height={10} rx={2.5} fill="#0D181B" stroke={AMBER} strokeWidth={1.5} />
            </Stage>

            {/* kubernetes: a hull with orbiting pods */}
            <Stage index={4} progress={scrollYProgress} animate={animate}>
              <polygon
                points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8"
                fill="#0D181B"
                stroke={BONE}
                strokeWidth={1.5}
              />
              <circle r={3} fill={AMBER} />
              <g>
                <circle cx={24} cy={0} r={2.5} fill={MIST} />
                <circle cx={-12} cy={21} r={2.5} fill={MIST} />
                <circle cx={-12} cy={-21} r={2.5} fill={MIST} />
                {animate && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur="10s"
                    repeatCount="indefinite"
                  />
                )}
              </g>
            </Stage>

            {/* production: the globe, pinging on every arrival */}
            <Stage index={5} progress={scrollYProgress} animate={animate}>
              <circle r={16} fill="#0D181B" stroke={BONE} strokeWidth={1.5} />
              <ellipse rx={16} ry={6.5} fill="none" stroke={BONE} strokeWidth={1} />
              <ellipse rx={6.5} ry={16} fill="none" stroke={BONE} strokeWidth={1} />
              {animate && (
                <circle r={16} fill="none" stroke={AMBER} strokeWidth={1.5}>
                  <animate attributeName="r" values="16;30" dur="2.7s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0" dur="2.7s" repeatCount="indefinite" />
                </circle>
              )}
            </Stage>

            {/* commits riding the wire */}
            {animate &&
              [0, -2.7, -5.4].map((begin) => (
                <g key={begin}>
                  <circle r={7} fill={AMBER} opacity={0.16} />
                  <circle r={3.2} fill={AMBER} />
                  <animateMotion dur="8s" begin={`${begin}s`} repeatCount="indefinite" rotate="none">
                    <mpath href="#pipe-route" />
                  </animateMotion>
                </g>
              ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
