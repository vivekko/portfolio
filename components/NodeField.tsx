'use client';

import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; vx: number; vy: number };
type Packet = { a: number; b: number; t: number; speed: number };

const LINK_DIST = 140;
const PROBE_DIST = 220;

// A drifting node topology drawn on canvas. Nodes link to near neighbours;
// the pointer acts as a probe that nearby nodes connect to, and packets
// travel along live edges. Pauses when scrolled past or off-screen.
export default function NodeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let running = true;
    let lastSpawn = 0;
    const pointer = { x: -9999, y: -9999 };

    const seed = () => {
      const count = Math.min(110, Math.floor((w * h) / 16000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }));
      packets = [];
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced) draw(0);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      if (!reduced) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -10) n.x = w + 10;
          if (n.x > w + 10) n.x = -10;
          if (n.y < -10) n.y = h + 10;
          if (n.y > h + 10) n.y = -10;
        }
      }

      // edges between near neighbours
      const liveEdges: Array<[number, number]> = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const d = Math.sqrt(d2);
            const a = (1 - d / LINK_DIST) * 0.14;
            ctx.strokeStyle = `rgba(140,163,160,${a})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
            liveEdges.push([i, j]);
          }
        }
      }

      // the probe: pointer links to nearby nodes in signal amber
      let probed = false;
      for (const n of nodes) {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < PROBE_DIST * PROBE_DIST) {
          probed = true;
          const d = Math.sqrt(d2);
          const a = (1 - d / PROBE_DIST) * 0.45;
          ctx.strokeStyle = `rgba(227,176,75,${a})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
          ctx.fillStyle = `rgba(227,176,75,${0.35 + a})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (probed) {
        ctx.fillStyle = 'rgba(227,176,75,0.9)';
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodes
      ctx.fillStyle = 'rgba(232,228,215,0.32)';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // packets riding live edges
      if (!reduced) {
        if (now - lastSpawn > 650 && liveEdges.length > 0 && packets.length < 7) {
          const [a, b] = liveEdges[Math.floor(Math.random() * liveEdges.length)];
          packets.push({ a, b, t: 0, speed: 0.9 + Math.random() * 0.9 });
          lastSpawn = now;
        }
        packets = packets.filter((p) => p.t <= 1);
        for (const p of packets) {
          p.t += 0.016 * p.speed;
          const na = nodes[p.a];
          const nb = nodes[p.b];
          if (!na || !nb) continue;
          const px = na.x + (nb.x - na.x) * p.t;
          const py = na.y + (nb.y - na.y) * p.t;
          ctx.fillStyle = 'rgba(227,176,75,0.85)';
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (now: number) => {
      // skip work while the hero is fully covered by the scrolled content
      if (running && window.scrollY < window.innerHeight * 1.3) {
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
    });
    io.observe(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    resize();
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />;
}
