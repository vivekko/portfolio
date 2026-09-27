'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const EXPERIENCES = [
  {
    company: 'Smarsh',
    role: 'Software Engineer II',
    place: 'Pune, India',
    period: 'Jun 2025 — present',
    summary:
      'Java modernization and delivery pipelines for enterprise compliance systems.',
    highlights: [
      'Led the Java 8 → 17 migration across 10 production microservices, deployed with zero downtime',
      'Built Concourse CI/CD pipelines covering build, deploy, and smoke tests',
    ],
    tech: 'Java 17 / Spring Boot / Concourse / AWS',
  },
  {
    company: 'Trux',
    role: 'Software Engineer',
    place: 'Boston, MA — remote',
    period: 'Oct 2023 — Jun 2025',
    summary:
      'Event-driven systems for a logistics platform moving real trucks with real cargo.',
    highlights: [
      'Engineered FMCSA/USDOT carrier verification, contributing to a 55% lift in sales conversion',
      'Designed Kinesis-based microservices for virtual load generation',
      'Built GPS geofence tracking (TRUXHMA), streamlining driver compliance by 30%',
    ],
    tech: 'Spring Boot / AWS Kinesis / PostgreSQL / geofencing',
  },
  {
    company: 'Turtlemint',
    role: 'Software Engineer',
    place: 'Pune, India',
    period: 'Jun 2022 — Oct 2023',
    summary:
      'Authentication, security, and observability for a fintech insurance platform.',
    highlights: [
      'Unified auth layer with OIDC/SAML via Keycloak for single sign-on and sign-out',
      'Redis-based distributed rate limiting with a sliding-window algorithm',
      'Istio service mesh for mTLS, traffic routing, and distributed tracing',
      '20× faster builds by migrating Maven to Gradle on Java 17',
    ],
    tech: 'Spring Boot / Keycloak / Redis / Istio / Kubernetes',
  },
  {
    company: 'Turtlemint',
    role: 'Software Engineer Intern',
    place: 'Mumbai, India',
    period: 'Feb 2022 — Jun 2022',
    summary: 'Reactive services and infrastructure reliability.',
    highlights: [
      'Reactive Spring Boot service with WebFlux and Reactor for non-blocking API consumption',
      'Migrated RabbitMQ from standalone to clustered mode for fault tolerance',
    ],
    tech: 'Spring WebFlux / RabbitMQ / Docker / Jenkins',
  },
];

function Card({ exp, index }: { exp: (typeof EXPERIENCES)[number]; index: number }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-line bg-panel p-7 sm:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="flex items-baseline gap-5">
          <span className="font-mono text-sm text-signal">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="type-subdisplay text-3xl text-bone">{exp.company}</h3>
            <p className="mt-1 text-sm text-mist">
              {exp.role}, {exp.place}
            </p>
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs text-mist">{exp.period}</span>
      </div>

      <p className="mt-6 max-w-2xl text-base text-bone/90">{exp.summary}</p>

      <ul className="mt-5 max-w-3xl space-y-2.5">
        {exp.highlights.map((h) => (
          <li key={h} className="flex gap-3 text-sm leading-relaxed text-mist">
            <span className="mt-[9px] h-px w-4 shrink-0 bg-signal/70" />
            {h}
          </li>
        ))}
      </ul>

      <p className="mt-auto border-t border-line pt-4 font-mono text-xs text-mist/80">
        {exp.tech}
      </p>
    </article>
  );
}

// Desktop: the section pins full-screen and the timeline travels
// horizontally as you scroll. Small screens get the vertical list.
export default function Experience() {
  const [horizontal, setHorizontal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia(
      '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'
    );
    const update = () => setHorizontal(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!horizontal) return;
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setShift(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [horizontal]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -shift]);

  if (!horizontal) {
    return (
      <section className="relative z-10 bg-ink">
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-20 lg:px-8">
          {EXPERIENCES.map((exp, i) => (
            <Card key={`${exp.company}-${exp.period}`} exp={exp} index={i} />
          ))}
          <p className="pt-8 text-sm text-mist">
            B.Tech in Computer Science &amp; Engineering, 2018–2022.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative z-10 bg-ink" style={{ height: '380vh' }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex w-max items-stretch gap-8 px-[8vw]"
        >
          {EXPERIENCES.map((exp, i) => (
            <div key={`${exp.company}-${exp.period}`} className="w-[62vw] max-w-3xl shrink-0">
              <Card exp={exp} index={i} />
            </div>
          ))}
          {/* end cap */}
          <div className="flex w-[30vw] shrink-0 flex-col justify-center">
            <p className="type-subdisplay text-2xl text-bone">
              Before all of this —
            </p>
            <p className="mt-3 max-w-xs text-sm text-mist">
              B.Tech in Computer Science &amp; Engineering, 2018–2022.
            </p>
          </div>
        </motion.div>

        {/* travel progress */}
        <div className="absolute bottom-12 left-[8vw] right-[8vw] h-px bg-line">
          <motion.div
            className="h-px origin-left bg-signal"
            style={{ scaleX: scrollYProgress }}
          />
        </div>
      </div>
    </section>
  );
}
