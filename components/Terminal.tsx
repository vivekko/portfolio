'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type Line = { text: string; kind: 'in' | 'out' | 'ok' | 'err' };

const HELP = [
  'available commands:',
  '  whoami   stack   experience   contact   health',
  '  ls   cat <file>   pwd   echo   date   top   ping <host>',
  '  git status   history   goto <section>   clear',
  'some commands are undocumented. typos may be rewarded.',
];

const FILES: Record<string, string[]> = {
  'readme.md': [
    '# vivek ojha — backend engineer',
    'this terminal is real enough. `ls -a` if you like snooping.',
  ],
  'resume.txt': [
    '2025-       smarsh       software engineer ii',
    '2023-2025   trux         software engineer',
    '2022-2023   turtlemint   software engineer',
    '2022        turtlemint   software engineer intern',
    '',
    'full version on request: vivekojha961@gmail.com',
  ],
  '.plan': [
    '1. make systems boring (boring = reliable)',
    '2. keep latency low and coffee strong',
    '3. ship',
  ],
};

const OUTPUTS: Record<string, string[]> = {
  whoami: [
    'Vivek Ojha — Software Engineer II @ Smarsh',
    'backend engineer: distributed systems, event streaming,',
    'and the plumbing that keeps them honest at scale.',
  ],
  stack: [
    'languages   java 8-17, python, javascript, sql',
    'runtime     spring boot, webflux, kafka, kinesis, redis',
    'platform    aws, docker, kubernetes, istio, terraform',
    'delivery    jenkins, concourse, github actions, gradle',
  ],
  experience: FILES['resume.txt'].slice(0, 4),
  contact: [
    'email     vivekojha961@gmail.com',
    'github    github.com/vivekko',
    'linkedin  linkedin.com/in/vivek-ojha-a540a9172',
  ],
  health: ['{ "status": "UP", "kafka": "UP", "redis": "UP", "coffee": "CRITICAL" }'],
  top: [
    '  PID  COMMAND      CPU    MEM',
    '    1  jvm          12%   2.1G   (java. of course it is.)',
    '   42  kafka         3%   512M',
    '  101  redis         1%    64M',
    ' 1337  coffee.d     99%     —',
  ],
  pwd: ['/home/vivek'],
  uname: ['PortfolioOS 5.1 (vivek-prod) — next.js 16, kafka, and caffeine'],
};

const SECTIONS: Record<string, string> = {
  work: '#work',
  models: '#models',
  stack: '#stack',
  contact: '#contact',
  top: '#top',
};

const TRAIN = [
  '      o o O O',
  '   ______      ___________',
  ' _|[____]|____|_/_/_/_/_/_|',
  '  (o)--(o)-(o)---(o)--(o)',
];

const PROMPT = 'vivek@prod ~ %';

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState('');
  const [booted, setBooted] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [train, setTrain] = useState(false);
  const busyRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = (ls: Line[]) => setLines((prev) => [...prev, ...ls].slice(-300));
  const out = (texts: string[], kind: Line['kind'] = 'out') =>
    texts.map((text) => ({ text, kind }));

  // boot: the terminal introduces itself by running whoami
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = () => {
      setLines([
        { text: 'whoami', kind: 'in' },
        ...out(OUTPUTS.whoami),
        { text: 'type `help` to look around', kind: 'ok' },
      ]);
      setBooted(true);
    };
    if (reduced) {
      finish();
      return;
    }
    let i = 0;
    const cmd = 'whoami';
    let typer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      typer = setInterval(() => {
        i += 1;
        setLines([{ text: cmd.slice(0, i), kind: 'in' }]);
        if (i >= cmd.length) {
          clearInterval(typer);
          setTimeout(finish, 300);
        }
      }, 85);
    }, 1400);
    return () => {
      clearTimeout(start);
      clearInterval(typer);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, train]);

  // the surprise: rm -rf / takes the whole site down, then the backups kick in
  const runRmRf = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      push(
        out(
          [
            'rm: removing everything ...',
            'CRITICAL: filesystem integrity lost',
            '...just kidding. restoring from s3://vivek-prod-backups',
            'restore complete (2.3s). always. have. backups.',
          ],
          'err'
        ).map((l, i) => (i > 1 ? { ...l, kind: 'ok' as const } : l))
      );
      return;
    }
    busyRef.current = true;
    const step = (delay: number, fn: () => void) => setTimeout(fn, delay);
    step(0, () => push(out(['rm: descending into /var/www/portfolio ...'])));
    step(450, () => push(out(['rm: removing sections/ (7 files)'])));
    step(900, () => push(out(['rm: removing kubernetes/ manifests ...'])));
    step(1300, () => {
      push(out(['CRITICAL: filesystem integrity lost'], 'err'));
      document.body.classList.add('sys-crash');
    });
    step(2400, () =>
      push(out(['...just kidding. restoring from s3://vivek-prod-backups'], 'ok'))
    );
    step(3400, () => {
      push(out(['restore complete (2.3s). always. have. backups.'], 'ok'));
      busyRef.current = false;
    });
    step(4200, () => document.body.classList.remove('sys-crash'));
  };

  const runTrain = () => {
    setTrain(true);
    push(out(['you meant `ls`, right? too late. train’s here.'], 'ok'));
    setTimeout(() => setTrain(false), 3400);
  };

  const exec = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd || busyRef.current) return;
    push([{ text: cmd, kind: 'in' }]);
    const parts = cmd.split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);
    const largs = args.map((a) => a.toLowerCase());

    switch (name) {
      case 'clear':
        setLines([]);
        return;
      case 'help':
        push(out(HELP));
        return;
      case 'ls': {
        const all = largs.includes('-a') || largs.includes('-la') || largs.includes('-al');
        push(
          out([
            all
              ? '.plan  .s3cret  README.md  projects/  resume.txt'
              : 'README.md  projects/  resume.txt',
          ])
        );
        return;
      }
      case 'sl':
        runTrain();
        return;
      case 'cat': {
        const f = largs[0] ?? '';
        if (!f) push(out(['usage: cat <file>'], 'err'));
        else if (f === '.s3cret')
          push(out(['cat: .s3cret: permission denied — even easter eggs need auth'], 'err'));
        else if (FILES[f]) push(out(FILES[f]));
        else push(out([`cat: ${args[0]}: no such file`], 'err'));
        return;
      }
      case 'cd':
        push(out(['cd: this filesystem is one page deep — try `goto work`']));
        return;
      case 'echo':
        push(out([args.join(' ').replace(/\$USER/g, 'vivek') || '']));
        return;
      case 'date':
        push(out([new Date().toString()]));
        return;
      case 'history':
        push(out(history.slice(0, 20).map((h, i) => `  ${history.length - i}  ${h}`).reverse()));
        return;
      case 'man':
        if (largs[0] === 'rm')
          push(out(['rm — remove files. pairs dangerously well with -rf /.']));
        else push(out([`no manual entry for ${args[0] ?? '(nothing)'} — it’s a portfolio, wing it`]));
        return;
      case 'ping': {
        const host = args[0] ?? 'localhost';
        push(
          out([
            `PING ${host} (127.0.0.1): 56 data bytes`,
            'icmp_seq=0 time=0.41 ms',
            'icmp_seq=1 time=0.38 ms',
            'everything is localhost if you believe.',
          ])
        );
        return;
      }
      case 'git':
        if (largs[0] === 'status')
          push(out(['On branch main. Working tree clean.', 'Ships on merge.']));
        else push(out(['git: try `git status`']));
        return;
      case 'vim':
      case 'vi':
      case 'nano':
      case 'emacs':
        push(out([':q! won’t save you here. this terminal has no exit either.']));
        return;
      case 'exit':
      case 'quit':
        push(out(['there is no exit. only `goto contact`.']));
        return;
      case 'uname':
        push(out(OUTPUTS.uname));
        return;
      case 'rm':
        if (largs.includes('-rf') || largs.includes('-fr')) runRmRf();
        else push(out(['rm: permission denied (you know what you were trying to do)'], 'err'));
        return;
      case 'sudo': {
        const rest = largs.join(' ');
        if (rest === 'hire vivek')
          push(out(['permission granted — vivekojha961@gmail.com'], 'ok'));
        else if (largs[0] === 'cat' && largs[1] === '.s3cret')
          push(out(['ok. the secret: there is no secret. but do try `rm -rf /`.'], 'ok'));
        else if (largs[0] === 'rm' && (largs.includes('-rf') || largs.includes('-fr'))) runRmRf();
        else push(out(['nice try. permission denied.'], 'err'));
        return;
      }
      case 'goto': {
        const target = SECTIONS[largs[0] ?? ''];
        if (target) {
          push(out([`navigating to ${largs[0]}…`], 'ok'));
          document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
        } else {
          push(out(['usage: goto work | models | stack | contact'], 'err'));
        }
        return;
      }
      default:
        if (name in OUTPUTS) push(out(OUTPUTS[name]));
        else push(out([`command not found: ${name} (try: help)`], 'err'));
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      exec(input);
      if (input.trim()) setHistory((h) => [input, ...h].slice(0, 50));
      setHIdx(-1);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = Math.min(hIdx + 1, history.length - 1);
      if (history[idx]) {
        setHIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = hIdx - 1;
      setHIdx(idx);
      setInput(idx >= 0 ? history[idx] : '');
    }
  };

  return (
    <div
      className="relative flex h-[400px] flex-col overflow-hidden rounded-lg border border-line bg-[#0B1517]/85 backdrop-blur-sm"
      onClick={() => inputRef.current?.focus()}
      data-cursor="type"
    >
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#C9705C]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#D9A441]/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#86B786]/70" />
        <span className="ml-3 font-mono text-[11px] text-mist">vivek@prod — zsh</span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-mist/70">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          live
        </span>
      </div>

      {/* scrollback */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-words">
            {line.kind === 'in' ? (
              <>
                <span className="text-mist/70">{PROMPT} </span>
                <span className="text-bone">{line.text}</span>
              </>
            ) : (
              <span
                className={
                  line.kind === 'ok'
                    ? 'text-signal'
                    : line.kind === 'err'
                      ? 'text-[#C9705C]'
                      : 'text-mist'
                }
              >
                {line.text}
              </span>
            )}
          </div>
        ))}

        {booted && (
          <div className="flex">
            <span className="shrink-0 text-mist/70">{PROMPT}&nbsp;</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="terminal input"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full bg-transparent text-bone caret-signal outline-none placeholder:text-mist/40"
              placeholder="help"
            />
          </div>
        )}
      </div>

      {/* the sl locomotive */}
      <AnimatePresence>
        {train && (
          <motion.pre
            initial={{ x: '110%' }}
            animate={{ x: '-110%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.2, ease: 'linear' }}
            className="pointer-events-none absolute bottom-10 left-0 z-10 font-mono text-[11px] leading-tight text-signal"
          >
            {TRAIN.join('\n')}
          </motion.pre>
        )}
      </AnimatePresence>
    </div>
  );
}
