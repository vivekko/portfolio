'use client';

import { useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';

// A measuring reticle that replaces the native cursor on precise pointers.
// It reads its own screen coordinates like an instrument, expands over
// interactive targets, and shows an action label when the target names one.
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const x = useSpring(mx, { stiffness: 550, damping: 45, mass: 0.6 });
  const y = useSpring(my, { stiffness: 550, damping: 45, mass: 0.6 });

  const readX = useTransform(x, (v) => String(Math.max(0, Math.round(v))).padStart(4, '0'));
  const readY = useTransform(y, (v) => String(Math.max(0, Math.round(v))).padStart(4, '0'));

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || still.matches) return;

    setEnabled(true);
    document.body.classList.add('has-reticle');

    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
    };
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(
        '[data-cursor], a, button, [role="button"], input, select, textarea, [role="tab"]'
      );
      if (el) {
        setInteractive(true);
        setLabel(el.getAttribute('data-cursor'));
      } else {
        setInteractive(false);
        setLabel(null);
      }
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.documentElement.addEventListener('pointerenter', onEnter);

    return () => {
      document.body.classList.remove('has-reticle');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.removeEventListener('pointerenter', onEnter);
    };
  }, [mx, my]);

  if (!enabled) return null;

  const ring = interactive ? 44 : 26;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x, y, opacity: visible ? 1 : 0 }}
    >
      {/* center dot */}
      <motion.div
        className="absolute rounded-full bg-signal"
        animate={{ width: 4, height: 4, x: -2, y: -2, scale: pressed ? 0.5 : 1 }}
        transition={{ duration: 0.15 }}
      />

      {/* ring + crosshair ticks */}
      <motion.svg
        className="absolute overflow-visible"
        width={ring}
        height={ring}
        viewBox="0 0 44 44"
        animate={{
          width: ring,
          height: ring,
          x: -ring / 2,
          y: -ring / 2,
          rotate: interactive ? 45 : 0,
          scale: pressed ? 0.85 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <circle
          cx="22"
          cy="22"
          r="15"
          fill="none"
          stroke={interactive ? 'var(--signal)' : 'rgba(232,228,215,0.45)'}
          strokeWidth={interactive ? 1.4 : 1}
        />
        {[0, 90, 180, 270].map((deg) => (
          <line
            key={deg}
            x1="22"
            y1="0"
            x2="22"
            y2="5.5"
            stroke={interactive ? 'var(--signal)' : 'rgba(232,228,215,0.6)'}
            strokeWidth="1"
            transform={`rotate(${deg} 22 22)`}
          />
        ))}
      </motion.svg>

      {/* coordinate readout */}
      <div className="absolute left-5 top-4 flex gap-1.5 font-mono text-[9px] leading-none text-mist/60">
        <motion.span>{readX}</motion.span>
        <span>/</span>
        <motion.span>{readY}</motion.span>
      </div>

      {/* action label */}
      <AnimatePresence>
        {label && (
          <motion.span
            key={label}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.18 }}
            className="absolute left-7 -top-1.5 whitespace-nowrap font-mono text-[10px] text-signal"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
