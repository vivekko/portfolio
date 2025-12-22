'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Briefcase, Calendar } from 'lucide-react';

export default function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const experiences = [
    {
      company: 'Smarsh',
      role: 'Backend Engineer',
      period: '2023 - Present',
      duration: '~1.5 years',
      description: 'Leading backend development initiatives in compliance and archiving solutions',
      highlights: [
        'Leading Storm migration to modernize data processing pipelines',
        'Architecting scalable microservices for enterprise compliance solutions',
        'Optimizing system performance and reducing API latencies',
        'Implementing cloud-native solutions with Kubernetes orchestration',
      ],
      technologies: ['Spring Boot', 'Kubernetes', 'Apache Storm', 'Microservices', 'AWS'],
    },
    {
      company: 'Trux Inc',
      role: 'Backend Engineer',
      period: '2021 - 2023',
      duration: '1.5 years',
      description: 'Built scalable backend systems for logistics and transportation platform',
      highlights: [
        'Designed and implemented event-driven microservices from scratch using AWS Kinesis',
        'Integrated OAuth authentication using Keycloak for secure service-to-service communication',
        'Implemented Istio service mesh over Kubernetes for enhanced observability and traffic management',
        'Reduced API response times through caching strategies and query optimization',
        'Developed RESTful APIs for real-time logistics tracking and fleet management',
      ],
      technologies: ['Spring Boot', 'AWS Kinesis', 'Keycloak', 'Istio', 'Kubernetes', 'RabbitMQ', 'PostgreSQL'],
    },
    {
      company: 'Turtlemint',
      role: 'Software Engineer',
      period: '2020 - 2021',
      duration: '1.5 years',
      description: 'Developed backend services for fintech insurance platform',
      highlights: [
        'Migrated monolithic applications from Java 8 to Java 17 with improved performance',
        'Built microservices for insurance policy management and payment processing',
        'Integrated third-party payment gateways and insurance APIs',
        'Implemented message queuing with Kafka for asynchronous processing',
        'Contributed to frontend development using AngularJS',
      ],
      technologies: ['Spring Boot', 'Java 17', 'Kafka', 'MySQL', 'AngularJS', 'Docker'],
    },
  ];

  return (
    <section id="experience" className="py-20 bg-slate-950" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-12 text-center">
            Experience
          </h2>

          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
                className="bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-800 hover:border-blue-500 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Briefcase className="text-blue-400" size={24} />
                      {exp.company}
                    </h3>
                    <p className="text-xl text-blue-400 font-semibold mt-1">{exp.role}</p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={18} />
                    <div className="text-right">
                      <p>{exp.period}</p>
                      <p className="text-sm text-slate-500">{exp.duration}</p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-300 mb-4">{exp.description}</p>

                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-2">Key Contributions:</h4>
                  <ul className="space-y-2">
                    {exp.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start text-slate-300">
                        <span className="text-blue-400 mr-2 mt-1">▹</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-800 text-blue-400 rounded-full text-sm border border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Education */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-800"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Education</h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xl text-blue-400 font-semibold">Bachelor of Technology (B.Tech)</p>
                <p className="text-slate-300">Computer Science & Engineering</p>
              </div>
              <div className="flex items-center gap-2 text-slate-400 mt-2 sm:mt-0">
                <Calendar size={18} />
                <p>2018 - 2022</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
