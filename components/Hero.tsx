'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Github, Linkedin, Mail } from 'lucide-react';

const NetworkVisualization = dynamic(() => import('./EnhancedNetworkVisualization'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

const LiveTerminal = dynamic(() => import('./LiveTerminal'), { ssr: false });
const MetricsDashboard = dynamic(() => import('./MetricsDashboard'), { ssr: false });

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-30">
        <NetworkVisualization />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Content */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Vivek Ojha
            </motion.h1>

            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Backend Engineer
              </span>
              <span className="text-slate-400 text-xl sm:text-2xl ml-3">@ Smarsh</span>
            </motion.h2>

            <motion.p
              className="text-lg sm:text-xl text-slate-300 mb-4 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <span className="text-blue-400 font-semibold">3+ years</span> building high-performance microservices & distributed systems.
              Specializing in <span className="text-emerald-400">Spring Boot</span>, <span className="text-purple-400">Kafka/Kinesis</span>, and <span className="text-orange-400">Kubernetes</span>.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {[
                { label: '55% Sales Increase', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' },
                { label: '30% Efficiency Gains', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
                { label: '20x Faster Builds', color: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
              ].map((badge, idx) => (
                <span key={idx} className={`px-4 py-2 rounded-full text-sm font-medium border ${badge.color}`}>
                  {badge.label}
                </span>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <a
                href="https://github.com/vivekko"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Github size={20} />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/vivek-ojha-a540a9172/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Linkedin size={20} />
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:vivekojha961@gmail.com"
                className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Mail size={20} />
                <span>Email</span>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Live Terminal & Metrics Dashboard */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <LiveTerminal />
          <MetricsDashboard />
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-slate-400"
          >
            <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
              <motion.div
                className="w-1.5 h-3 bg-slate-400 rounded-full mt-2"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
