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
      company: 'Smarsh (Caizin)',
      location: 'Pune, India',
      role: 'Software Engineer II',
      period: 'Jun 2025 – Present',
      duration: 'Current',
      description: 'Leading Java modernization and CI/CD initiatives for enterprise compliance solutions',
      highlights: [
        'Led Java 8 to Java 17 migration across 10 production microservices with zero downtime deployment',
        'Architected CI/CD pipelines in Concourse for automated build, deployment, and smoke testing',
        'Maintained critical workflow integrity through comprehensive regression testing',
      ],
      technologies: ['Java 17', 'Spring Boot', 'Concourse CI', 'Microservices', 'AWS'],
    },
    {
      company: 'Trux, Inc.',
      location: 'Boston, MA (Remote)',
      role: 'Software Engineer',
      period: 'Oct 2023 – Jun 2025',
      duration: '1.5 years',
      description: 'Built scalable event-driven systems for logistics and transportation platform',
      highlights: [
        'Engineered FMCSA/USDOT verification integration, contributing to 55% increase in sales conversion',
        'Designed event-driven microservices using Amazon Kinesis for virtual load generation',
        'Built GPS-enabled geofence tracking system (TRUXHMA), streamlining driver compliance by 30%',
        'Reduced manual data entry errors through automated work log completion',
      ],
      technologies: ['Spring Boot', 'AWS Kinesis', 'PostgreSQL', 'GPS/Geofencing', 'REST APIs'],
    },
    {
      company: 'Turtlemint India',
      location: 'Pune, India',
      role: 'Software Engineer',
      period: 'Jun 2022 – Oct 2023',
      duration: '1.5 years',
      description: 'Developed authentication, security, and observability systems for fintech insurance platform',
      highlights: [
        'Implemented unified authentication layer with OIDC/SAML via Keycloak for SSO/SLO',
        'Built Redis-based distributed rate limiting using sliding window algorithm (DoS prevention)',
        'Integrated Istio service mesh for mTLS, traffic routing, and distributed tracing',
        'Achieved 20x improvement in build times migrating Maven to Gradle on Java 17',
        'Built AWS Cost Usage dashboards in Superset for real-time cloud spend visibility',
      ],
      technologies: ['Spring Boot', 'Keycloak', 'Redis', 'Istio', 'Kubernetes', 'Java 17', 'Superset'],
    },
    {
      company: 'Turtlemint India',
      location: 'Mumbai, India',
      role: 'Software Engineer Intern',
      period: 'Feb 2022 – Jun 2022',
      duration: '5 months',
      description: 'Built reactive applications and improved infrastructure reliability',
      highlights: [
        'Built reactive Spring Boot application with WebFlux & Reactor for non-blocking API consumption',
        'Migrated RabbitMQ from standalone to clustered mode for improved fault tolerance',
        'Containerized applications with Docker and deployed to Kubernetes with Jenkins CI/CD',
      ],
      technologies: ['Spring WebFlux', 'Reactor', 'RabbitMQ', 'Docker', 'Kubernetes', 'Jenkins'],
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
                    {'location' in exp && (
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <span>📍</span> {exp.location}
                      </p>
                    )}
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
