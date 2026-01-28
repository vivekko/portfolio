'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mail, Linkedin, Github, MapPin, Code2 } from 'lucide-react';

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const contactLinks = [
    {
      icon: Mail,
      label: 'Email',
      value: 'vivekojha961@gmail.com',
      href: 'mailto:vivekojha961@gmail.com',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: 'vivek-ojha',
      href: 'https://www.linkedin.com/in/vivek-ojha-a540a9172/',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Github,
      label: 'GitHub',
      value: '@vivekko',
      href: 'https://github.com/vivekko',
      color: 'from-slate-500 to-slate-700',
    },
  ];

  return (
    <section id="contact" className="py-20 bg-slate-950" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Let&apos;s Connect
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto">
            Open to new opportunities and interesting projects. Feel free to reach out if you&apos;d like to discuss backend architecture, microservices, or potential collaborations.
          </p>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactLinks.map((contact, index) => (
              <motion.a
                key={index}
                href={contact.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="group bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-blue-500 transition-all duration-300 hover:scale-105"
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br ${contact.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <contact.icon className="text-white" size={24} />
                </div>
                <h3 className="text-white font-semibold mb-2">{contact.label}</h3>
                <p className="text-slate-400 text-sm break-all">{contact.value}</p>
              </motion.a>
            ))}
          </div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="inline-flex items-center gap-2 bg-slate-900 rounded-full px-6 py-3 border border-slate-800 mb-8"
          >
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-slate-300 font-medium">Software Engineer II @ Smarsh • Open to opportunities</span>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 border border-blue-500"
          >
            <Code2 className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">
              Let&apos;s Build Something Great
            </h3>
            <p className="text-blue-100 mb-6">
              Interested in discussing backend architecture, microservices patterns, or exploring opportunities at innovative companies? Let&apos;s connect!
            </p>
            <a
              href="mailto:vivekojha961@gmail.com"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-300"
            >
              Get In Touch
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-800"
      >
        <div className="text-center text-slate-500">
          <p className="mb-2">Built with Next.js, Three.js & Framer Motion</p>
          <p>&copy; {new Date().getFullYear()} Vivek Ojha. All rights reserved.</p>
        </div>
      </motion.div>
    </section>
  );
}
