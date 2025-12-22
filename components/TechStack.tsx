'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Server,
  Database,
  Cloud,
  GitBranch,
  Box,
  Zap,
  Lock,
  Layers,
  Activity,
  Code2
} from 'lucide-react';

export default function TechStack() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const techStacks = [
    {
      category: 'Backend & Frameworks',
      icon: Server,
      color: 'from-blue-500 to-cyan-500',
      skills: [
        'Spring Boot',
        'Java 17',
        'Microservices',
        'REST APIs',
        'GraphQL',
        'gRPC',
      ],
    },
    {
      category: 'Cloud & Orchestration',
      icon: Cloud,
      color: 'from-purple-500 to-pink-500',
      skills: [
        'Kubernetes',
        'Docker',
        'Istio',
        'AWS',
        'Terraform',
        'Helm',
      ],
    },
    {
      category: 'Message Queues',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      skills: [
        'Apache Kafka',
        'RabbitMQ',
        'AWS Kinesis',
        'Apache Storm',
        'Redis Streams',
      ],
    },
    {
      category: 'Databases',
      icon: Database,
      color: 'from-green-500 to-emerald-500',
      skills: [
        'PostgreSQL',
        'MySQL',
        'MongoDB',
        'Redis',
        'Elasticsearch',
        'Cassandra',
      ],
    },
    {
      category: 'DevOps & CI/CD',
      icon: GitBranch,
      color: 'from-yellow-500 to-orange-500',
      skills: [
        'Git',
        'Jenkins',
        'GitHub Actions',
        'ArgoCD',
        'Prometheus',
        'Grafana',
      ],
    },
    {
      category: 'Security & Auth',
      icon: Lock,
      color: 'from-red-500 to-pink-500',
      skills: [
        'OAuth 2.0',
        'Keycloak',
        'JWT',
        'SSL/TLS',
        'Spring Security',
      ],
    },
    {
      category: 'Monitoring & Observability',
      icon: Activity,
      color: 'from-teal-500 to-cyan-500',
      skills: [
        'Prometheus',
        'Grafana',
        'ELK Stack',
        'Jaeger',
        'Datadog',
        'New Relic',
      ],
    },
    {
      category: 'Architecture Patterns',
      icon: Layers,
      color: 'from-indigo-500 to-purple-500',
      skills: [
        'Event-Driven',
        'CQRS',
        'Saga Pattern',
        'Circuit Breaker',
        'API Gateway',
        'Service Mesh',
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <section id="tech-stack" className="py-20 bg-slate-900 relative overflow-hidden" ref={ref}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Tech Stack & Expertise
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Building scalable distributed systems with modern backend technologies
            </p>
          </div>

          {/* Tech Categories Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {techStacks.map((stack, index) => {
              const Icon = stack.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stack.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stack.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white" size={24} />
                    </div>

                    {/* Category Title */}
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {stack.category}
                    </h3>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {stack.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 text-xs font-medium text-slate-300 bg-slate-900/50 rounded border border-slate-700 group-hover:border-slate-600 group-hover:text-blue-400 transition-colors duration-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: Code2, label: 'Languages', value: 'Java, Python, JS' },
              { icon: Box, label: 'Containers', value: 'Docker, K8s' },
              { icon: Database, label: 'Databases', value: 'SQL, NoSQL' },
              { icon: Zap, label: 'Event Streaming', value: 'Kafka, Kinesis' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center hover:border-blue-500 transition-all duration-300"
                >
                  <Icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-sm text-slate-400 mb-1">{stat.label}</div>
                  <div className="text-lg font-semibold text-white">{stat.value}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
