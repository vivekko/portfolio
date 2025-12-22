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
      title: 'Microservices Architecture',
      description: 'Expert in building event-driven microservices with Spring Boot, Kafka, and RabbitMQ',
    },
    {
      icon: Cloud,
      title: 'Cloud & Infrastructure',
      description: 'Proficient in Kubernetes, Istio service mesh, and cloud-native application development',
    },
    {
      icon: Database,
      title: 'Data Engineering',
      description: 'Experience with AWS Kinesis, distributed systems, and real-time data processing',
    },
    {
      icon: GitBranch,
      title: 'DevOps & CI/CD',
      description: 'Skilled in pipeline automation, containerization, and infrastructure as code',
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
                Backend Engineer with <span className="text-blue-400 font-semibold">3 years of experience</span> building
                high-performance distributed systems for fintech and logistics industries.
              </p>
              <p className="text-slate-300 text-lg leading-relaxed">
                Specialized in designing and implementing scalable microservices architectures using Spring Boot,
                with expertise in OAuth integration via Keycloak, service mesh implementation with Istio,
                and cloud-native development on Kubernetes.
              </p>
              <p className="text-slate-300 text-lg leading-relaxed">
                Currently leading Storm migration initiatives at Smarsh, while continuously optimizing
                API performance and building event-driven systems from the ground up.
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
                  <span className="text-blue-400 mr-2">▹</span>
                  <span>Migrated legacy systems from Java 8 to Java 17</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">▹</span>
                  <span>Integrated OAuth authentication using Keycloak</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">▹</span>
                  <span>Implemented Istio service mesh over Kubernetes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">▹</span>
                  <span>Reduced API latencies through optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">▹</span>
                  <span>Built event-driven microservices with AWS Kinesis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">▹</span>
                  <span>Leading Storm migration at Smarsh</span>
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
