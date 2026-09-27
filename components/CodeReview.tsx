'use client';

import { useState } from 'react';

// tokens: k keyword, t type, s string, c comment, n number, m method, plain string
type Tok = { c?: 'k' | 't' | 's' | 'c' | 'n' | 'm'; x: string };
const T = (x: string): Tok => ({ x });
const K = (x: string): Tok => ({ c: 'k', x });
const Ty = (x: string): Tok => ({ c: 't', x });
const S = (x: string): Tok => ({ c: 's', x });
const C = (x: string): Tok => ({ c: 'c', x });
const N = (x: string): Tok => ({ c: 'n', x });
const M = (x: string): Tok => ({ c: 'm', x });

const CODE: Tok[][] = [
  [K('public'), T(' '), K('boolean'), T(' '), M('allow'), T('('), Ty('String'), T(' clientId) {')],
  [T('  '), K('long'), T(' now = clock.'), M('millis'), T('();')],
  [T('  '), Ty('String'), T(' key = '), S('"rl:"'), T(' + clientId;')],
  [],
  [T('  '), Ty('List'), T('<'), Ty('Object'), T('> r = redis.'), M('pipelined'), T('(ops -> {')],
  [T('    ops.'), M('zRemRangeByScore'), T('(key, '), N('0'), T(', now - WINDOW_MS);')],
  [T('    ops.'), M('zCard'), T('(key);')],
  [T('    ops.'), M('zAdd'), T('(key, now, now + '), S('":"'), T(' + '), M('nonce'), T('());')],
  [T('    ops.'), M('pExpire'), T('(key, WINDOW_MS);')],
  [T('  });')],
  [],
  [T('  '), K('long'), T(' inWindow = ('), Ty('Long'), T(') r.'), M('get'), T('('), N('1'), T(');')],
  [T('  '), K('if'), T(' (inWindow >= LIMIT) {')],
  [T('    redis.'), M('zRem'), T('(key, lastMember);  '), C('// undo our own add')],
  [T('    metrics.'), M('count'), T('('), S('"ratelimit.rejected"'), T(', clientId);')],
  [T('    '), K('return'), T(' '), K('false'), T(';')],
  [T('  }')],
  [T('  '), K('return'), T(' '), K('true'), T(';')],
  [T('}')],
];

const NOTES: { from: number; to: number; title: string; body: string }[] = [
  {
    from: 2,
    to: 3,
    title: 'One sorted set per caller',
    body: 'The member embeds a nonce, so two requests landing in the same millisecond stay distinct instead of silently overwriting each other.',
  },
  {
    from: 5,
    to: 10,
    title: 'One round trip, not four',
    body: 'Evict expired entries, count, add, refresh the TTL — pipelined into a single Redis hop. This is what keeps the limiter invisible in the latency budget.',
  },
  {
    from: 12,
    to: 16,
    title: 'Optimistic add, then roll back',
    body: 'Add first, remove if over the limit. Cheaper than a Lua script and correct enough under contention for what this is: a DoS guard, not a billing meter.',
  },
  {
    from: 15,
    to: 15,
    title: 'Rejections are data',
    body: 'Every rejection is metered per client. Abuse shows up on a dashboard before it shows up in support tickets.',
  },
];

const TOKEN_CLASS: Record<NonNullable<Tok['c']>, string> = {
  k: 'text-signal',
  t: 'text-[#6FA8B0]',
  s: 'text-[#86B786]',
  c: 'italic text-mist/60',
  n: 'text-[#D9A441]',
  m: 'text-bone',
};

export default function CodeReview() {
  const [active, setActive] = useState<number | null>(null);
  const note = active !== null ? NOTES[active] : null;

  return (
    <section className="relative z-10 bg-ink">
      <div className="mx-auto max-w-6xl px-6 py-28 lg:px-8">
        <h2 className="type-display text-[clamp(2.4rem,6vw,4.5rem)] text-bone">
          Code, annotated
        </h2>
        <p className="mt-4 max-w-xl text-base text-mist">
          The Redis sliding-window rate limiter I shipped at Turtlemint,
          trimmed for the page — with the reasoning left in the margin.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* the code */}
          <div className="overflow-x-auto rounded-lg border border-line bg-[#0B1517]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="font-mono text-[11px] text-mist">
                SlidingWindowRateLimiter.java
              </span>
              <span className="ml-auto font-mono text-[10px] text-mist/60">
                hover a note to trace it
              </span>
            </div>
            <pre className="p-4 font-mono text-[13px] leading-[1.7]">
              {CODE.map((toks, i) => {
                const ln = i + 1;
                const hit = note && ln >= note.from && ln <= note.to;
                return (
                  <div
                    key={i}
                    className={`flex px-2 transition-colors duration-200 ${
                      hit ? 'bg-signal/10' : note ? 'opacity-40' : ''
                    }`}
                  >
                    <span
                      className={`w-8 shrink-0 select-none text-right pr-4 ${
                        hit ? 'text-signal' : 'text-mist/40'
                      }`}
                    >
                      {ln}
                    </span>
                    <code className="whitespace-pre text-bone/85">
                      {toks.length === 0
                        ? ' '
                        : toks.map((t, j) => (
                            <span key={j} className={t.c ? TOKEN_CLASS[t.c] : undefined}>
                              {t.x}
                            </span>
                          ))}
                    </code>
                  </div>
                );
              })}
            </pre>
          </div>

          {/* the margin */}
          <div className="flex flex-col justify-center gap-3" onMouseLeave={() => setActive(null)}>
            {NOTES.map((n, i) => (
              <button
                key={n.title}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(active === i ? null : i)}
                data-cursor="trace"
                className={`relative rounded-md border p-5 text-left transition-colors duration-200 ${
                  active === i
                    ? 'border-signal/50 bg-panel'
                    : 'border-line bg-transparent hover:bg-panel/60'
                }`}
              >
                <span className="font-mono text-[10px] text-signal">
                  L{n.from}
                  {n.to !== n.from ? `–${n.to}` : ''}
                </span>
                <h3 className="mt-1.5 text-base font-medium text-bone">{n.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mist">{n.body}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
