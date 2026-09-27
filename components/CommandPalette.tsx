'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

type Command = {
  label: string;
  hint: string;
  run: () => void | Promise<void>;
};

const scrollTo = (sel: string) => () => {
  document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' });
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setIdx(0);
    setToast(null);
  }, []);

  const commands: Command[] = [
    { label: 'Go to top', hint: 'section', run: scrollTo('#top') },
    { label: 'Go to work', hint: 'section', run: scrollTo('#work') },
    { label: 'Go to models', hint: 'section', run: scrollTo('#models') },
    { label: 'Go to stack', hint: 'section', run: scrollTo('#stack') },
    { label: 'Go to contact', hint: 'section', run: scrollTo('#contact') },
    {
      label: 'Copy email',
      hint: 'vivekojha961@gmail.com',
      run: async () => {
        await navigator.clipboard.writeText('vivekojha961@gmail.com');
        setToast('email copied');
      },
    },
    {
      label: 'Open GitHub',
      hint: 'github.com/vivekko',
      run: () => window.open('https://github.com/vivekko', '_blank', 'noopener'),
    },
    {
      label: 'Open LinkedIn',
      hint: 'linkedin.com/in/vivek-ojha',
      run: () =>
        window.open('https://www.linkedin.com/in/vivek-ojha-a540a9172/', '_blank', 'noopener'),
    },
  ];

  const results = commands.filter((c) =>
    (c.label + ' ' + c.hint).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        close();
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('palette:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('palette:open', onOpen);
    };
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => setIdx(0), [query]);

  const runCommand = async (cmd: Command) => {
    await cmd.run();
    // toast commands close on a delay so the confirmation is visible
    if (cmd.label === 'Copy email') {
      setTimeout(close, 700);
    } else {
      close();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[idx]) {
      runCommand(results[idx]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/70 px-4 pt-[18vh] backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg overflow-hidden rounded-lg border border-line bg-panel shadow-[0_24px_80px_rgba(4,10,11,0.7)]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <span className="font-mono text-xs text-signal">&gt;</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command…"
                aria-label="Search commands"
                className="w-full bg-transparent py-3.5 font-mono text-sm text-bone caret-signal outline-none placeholder:text-mist/50"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-mist">
                esc
              </kbd>
            </div>

            <ul className="max-h-72 overflow-y-auto py-2">
              {results.length === 0 && (
                <li className="px-4 py-3 font-mono text-xs text-mist">
                  nothing matches “{query}”
                </li>
              )}
              {results.map((cmd, i) => (
                <li key={cmd.label}>
                  <button
                    onClick={() => runCommand(cmd)}
                    onMouseEnter={() => setIdx(i)}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors duration-100 ${
                      i === idx ? 'bg-ink' : ''
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-4 w-px ${i === idx ? 'bg-signal' : 'bg-transparent'}`}
                      />
                      <span className={`text-sm ${i === idx ? 'text-bone' : 'text-mist'}`}>
                        {cmd.label}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-mist/60">{cmd.hint}</span>
                  </button>
                </li>
              ))}
            </ul>

            {toast && (
              <div className="border-t border-line px-4 py-2.5 font-mono text-xs text-signal">
                {toast}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
