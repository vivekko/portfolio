'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LogEntry {
  id: number;
  command: string;
  status: 'running' | 'success' | 'error';
  timestamp: string;
  output?: string;
}

const commands = [
  {
    command: 'kubectl apply -f deployment.yaml',
    output: 'deployment.apps/order-service configured',
    success: true,
  },
  {
    command: 'docker build -t order-service:v2.1.0 .',
    output: 'Successfully built 8f3a9c7d2e1b',
    success: true,
  },
  {
    command: 'helm upgrade payment-service ./charts',
    output: 'Release "payment-service" has been upgraded',
    success: true,
  },
  {
    command: 'kubectl rollout status deployment/user-service',
    output: 'deployment "user-service" successfully rolled out',
    success: true,
  },
  {
    command: 'kafka-topics --create --topic orders',
    output: 'Created topic orders with 3 partitions',
    success: true,
  },
  {
    command: 'mvn clean install -DskipTests',
    output: 'BUILD SUCCESS - Total time: 45.2 s',
    success: true,
  },
  {
    command: 'docker push gcr.io/project/service:latest',
    output: 'The push refers to repository [gcr.io/project/service]',
    success: true,
  },
  {
    command: 'kubectl scale deployment api-gateway --replicas=5',
    output: 'deployment.apps/api-gateway scaled',
    success: true,
  },
];

export default function LiveTerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const cmd = commands[currentIndex % commands.length];
      const timestamp = new Date().toLocaleTimeString();

      // Add command as running
      const runningLog: LogEntry = {
        id: Date.now(),
        command: cmd.command,
        status: 'running',
        timestamp,
      };

      setLogs((prev) => [...prev.slice(-4), runningLog]);

      // Update to success after 1.5 seconds
      setTimeout(() => {
        setLogs((prev) =>
          prev.map((log) =>
            log.id === runningLog.id
              ? {
                  ...log,
                  status: cmd.success ? 'success' : 'error',
                  output: cmd.output,
                }
              : log
          )
        );
      }, 1500);

      setCurrentIndex((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden shadow-2xl"
    >
      {/* Terminal Header */}
      <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-green-400" />
          <span className="text-sm text-slate-300 font-mono">
            production-deployment-terminal
          </span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-4 font-mono text-sm h-64 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="mb-3"
            >
              {/* Command line */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-400">$</span>
                <span className="text-slate-300">{log.command}</span>
                {log.status === 'running' && (
                  <Loader2 size={14} className="text-yellow-400 animate-spin" />
                )}
                {log.status === 'success' && (
                  <CheckCircle size={14} className="text-green-400" />
                )}
                {log.status === 'error' && (
                  <XCircle size={14} className="text-red-400" />
                )}
              </div>

              {/* Output */}
              {log.output && log.status !== 'running' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className={`text-xs ml-4 ${
                    log.status === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {log.output}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Cursor */}
        <div className="flex items-center gap-2">
          <span className="text-blue-400">$</span>
          <motion.div
            className="w-2 h-4 bg-green-400"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
      </div>
    </motion.div>
  );
}
