'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

function LocalTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Kolkata',
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-xs text-mist" suppressHydrationWarning>
      {time ? `${time} IST` : ''}
    </span>
  );
}

// The email pulls gently toward the cursor while hovered.
function MagneticEmail() {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 18 });
  const y = useSpring(my, { stiffness: 180, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left - rect.width / 2) * 0.08);
    my.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href="mailto:vivekojha961@gmail.com"
      data-cursor="write"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x, y }}
      className="type-display link-sweep inline-block break-all text-[clamp(1.6rem,4.6vw,4rem)] text-bone transition-colors duration-300 hover:text-signal"
    >
      vivekojha961@gmail.com
    </motion.a>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="relative z-10 border-t border-line bg-ink">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-28 lg:px-8 lg:pt-36">
        <p className="mb-6 font-mono text-xs text-mist">
          open to backend and platform roles
        </p>
        <h2 className="type-subdisplay mb-10 max-w-2xl text-3xl text-bone sm:text-4xl">
          Have a system that needs to scale — or one that already fell over?
        </h2>

        <MagneticEmail />

        <div className="mt-14 flex items-center gap-8">
          <a
            href="https://github.com/vivekko"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="open"
            className="link-sweep text-sm text-mist transition-colors duration-300 hover:text-bone"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/vivek-ojha-a540a9172/"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="open"
            className="link-sweep text-sm text-mist transition-colors duration-300 hover:text-bone"
          >
            LinkedIn
          </a>
        </div>

        <footer className="mt-24 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-mist">
            © {new Date().getFullYear()} Vivek Ojha. Built with Next.js and Framer Motion.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-mist">Pune, India</span>
            <LocalTime />
          </div>
        </footer>
      </div>
    </section>
  );
}
