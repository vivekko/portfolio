'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#models', label: 'Models' },
  { href: '#stack', label: 'Stack' },
  { href: '#contact', label: 'Contact' },
];

export default function Nav() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/70 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 lg:px-8">
        <a href="#top" className="text-sm font-medium tracking-wide text-bone">
          Vivek Ojha
          <span className="ml-2 font-mono text-[10px] text-mist/70">backend engineer</span>
        </a>
        <div className="flex items-center gap-6">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="link-sweep hidden text-[13px] text-mist transition-colors duration-300 hover:text-bone sm:block"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="link-sweep text-[13px] text-mist transition-colors duration-300 hover:text-bone sm:hidden"
          >
            Contact
          </a>
          <button
            onClick={() => window.dispatchEvent(new Event('palette:open'))}
            data-cursor="run"
            aria-label="Open command palette"
            className="rounded border border-line px-2 py-1 font-mono text-[11px] text-mist transition-colors duration-300 hover:border-line-strong hover:text-bone"
          >
            ⌘K
          </button>
        </div>
      </nav>
      {/* scroll position, drawn as a hairline */}
      <motion.div
        className="h-px origin-left bg-signal"
        style={{ scaleX: progress }}
      />
    </header>
  );
}
