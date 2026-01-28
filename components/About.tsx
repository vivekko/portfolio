'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Code2, Database, Cloud, GitBranch } from 'lucide-react';

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const highlights = [
    {
      icon: Code2,
      title: 'Microservices & APIs',
      description: 'Building event-driven microservices with Spring Boot, REST APIs, and reactive programming with WebFlux',
    },
    {
      icon: Cloud,
      title: 'Cloud & Kubernetes',
      description: 'AWS (Lambda, S3, ECS, Kinesis), Docker, Kubernetes orchestration, and Istio service mesh',
    },
    {
      icon: Database,
      title: 'Data & Streaming',
      description: 'Apache Kafka, Amazon Kinesis, Redis caching, PostgreSQL, and distributed data processing',
    },
    {
      icon: GitBranch,
      title: 'Security & DevOps',
      description: 'OAuth2/OIDC/SAML via Keycloak, CI/CD pipelines, Java migrations, and CVE remediation',
    },
  ];

  return (
    <section id="about" className="py-20 bg-slate-900" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8 text-center">
            About Me
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <p className="text-slate-300 text-lg leading-relaxed">
                Backend Engineer with <span className="text-blue-400 font-semibold">3+ years of experience</span> building
                high-performance microservices and distributed systems with a proven track record of delivering scalable solutions.
              </p>
              <p className="text-slate-300 text-lg leading-relaxed">
                Specialized in <span className="text-emerald-400 font-semibold">Java/Spring Boot ecosystems</span>,
                event-driven architectures (Kafka, Kinesis), and security-focused development including
                Java 8→17 migrations and CVE remediation.
              </p>
              <p className="text-slate-300 text-lg leading-relaxed">
                Delivered impactful solutions: <span className="text-purple-400 font-semibold">55% sales increase</span> through
                FMCSA integration, <span className="text-purple-400 font-semibold">30% operational efficiency</span> gains
                via geofence automation, and <span className="text-purple-400 font-semibold">20x build time improvement</span> through
                Gradle migration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Key Achievements</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">▹</span>
                  <span><span className="text-emerald-400 font-semibold">55%</span> sales increase via FMCSA/USDOT integration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">▹</span>
                  <span><span className="text-emerald-400 font-semibold">30%</span> efficiency gains through geofence automation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">▹</span>
                  <span><span className="text-emerald-400 font-semibold">20x</span> faster builds: Maven → Gradle migration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">▹</span>
                  <span><span className="text-emerald-400 font-semibold">10</span> microservices migrated Java 8 → 17</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">▹</span>
                  <span>Unified auth layer: OIDC/SAML via Keycloak</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">▹</span>
                  <span>Redis rate limiting for DoS prevention</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Highlights Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:scale-105"
              >
                <item.icon className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
