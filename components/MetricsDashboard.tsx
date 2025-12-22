'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, AlertCircle, Cpu } from 'lucide-react';

interface Metric {
  label: string;
  value: number;
  unit: string;
  icon: typeof Activity;
  color: string;
  trend: 'up' | 'down';
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: 'API Latency', value: 45, unit: 'ms', icon: Zap, color: 'text-blue-400', trend: 'down' },
    { label: 'Requests/sec', value: 1250, unit: '/s', icon: Activity, color: 'text-green-400', trend: 'up' },
    { label: 'Error Rate', value: 0.12, unit: '%', icon: AlertCircle, color: 'text-yellow-400', trend: 'down' },
    { label: 'CPU Usage', value: 42, unit: '%', icon: Cpu, color: 'text-purple-400', trend: 'up' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => {
          let newValue = metric.value;

          if (metric.label === 'API Latency') {
            newValue = Math.max(20, Math.min(80, metric.value + (Math.random() - 0.5) * 10));
          } else if (metric.label === 'Requests/sec') {
            newValue = Math.max(800, Math.min(2000, metric.value + (Math.random() - 0.5) * 100));
          } else if (metric.label === 'Error Rate') {
            newValue = Math.max(0, Math.min(1, metric.value + (Math.random() - 0.5) * 0.1));
          } else if (metric.label === 'CPU Usage') {
            newValue = Math.max(20, Math.min(80, metric.value + (Math.random() - 0.5) * 8));
          }

          return {
            ...metric,
            value: newValue,
            trend: newValue > metric.value ? 'up' : 'down',
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-green-400" />
            <span className="text-sm text-slate-300 font-semibold">
              System Metrics
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400">Live</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 space-y-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={metric.color} />
                  <span className="text-xs text-slate-400">{metric.label}</span>
                </div>
                <motion.span
                  key={metric.value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`text-xs font-semibold ${
                    metric.trend === 'up' ? 'text-green-400' : 'text-blue-400'
                  }`}
                >
                  {metric.trend === 'up' ? '↑' : '↓'}
                </motion.span>
              </div>

              <div className="flex items-baseline gap-1">
                <motion.span
                  key={metric.value}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`text-2xl font-bold ${metric.color}`}
                >
                  {metric.label === 'Requests/sec'
                    ? Math.round(metric.value).toLocaleString()
                    : metric.value.toFixed(metric.label === 'Error Rate' ? 2 : 0)}
                </motion.span>
                <span className="text-xs text-slate-500">{metric.unit}</span>
              </div>

              {/* Mini bar chart */}
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    metric.color === 'text-blue-400'
                      ? 'bg-blue-400'
                      : metric.color === 'text-green-400'
                      ? 'bg-green-400'
                      : metric.color === 'text-yellow-400'
                      ? 'bg-yellow-400'
                      : 'bg-purple-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      metric.label === 'Requests/sec'
                        ? `${(metric.value / 2000) * 100}%`
                        : metric.label === 'Error Rate'
                        ? `${(metric.value / 1) * 100}%`
                        : `${metric.value}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Status Footer */}
      <div className="bg-slate-800 px-4 py-2 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Last updated: just now</span>
          <div className="flex items-center gap-2">
            <span className="text-green-400">All systems operational</span>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
