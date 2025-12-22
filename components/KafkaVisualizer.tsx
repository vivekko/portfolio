'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Database, Users, Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  partition: number;
  offset: number;
  timestamp: number;
  data: string;
  status: 'producing' | 'in-topic' | 'consuming' | 'consumed';
}

interface ConsumerLag {
  groupId: string;
  partition: number;
  lag: number;
}

const TOPICS = [
  { name: 'payment-events', partitions: 3, color: '#10b981' },
  { name: 'order-events', partitions: 3, color: '#3b82f6' },
  { name: 'user-events', partitions: 2, color: '#f59e0b' },
];

const CONSUMER_GROUPS = [
  { id: 'payment-processor', topics: ['payment-events'], color: '#10b981' },
  { id: 'order-service', topics: ['order-events'], color: '#3b82f6' },
  { id: 'analytics-service', topics: ['payment-events', 'order-events', 'user-events'], color: '#8b5cf6' },
  { id: 'notification-service', topics: ['user-events'], color: '#f59e0b' },
];

const PRODUCERS = [
  { id: 'payment-api', topic: 'payment-events', rate: 2000 },
  { id: 'order-api', topic: 'order-events', rate: 1500 },
  { id: 'user-api', topic: 'user-events', rate: 3000 },
];

export default function KafkaVisualizer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [metrics, setMetrics] = useState({
    totalMessages: 0,
    messagesPerSec: 0,
    avgLatency: 45,
  });
  const [consumerLag, setConsumerLag] = useState<ConsumerLag[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const messageIdCounter = useRef(0);

  // Simulate message production
  useEffect(() => {
    const interval = setInterval(() => {
      const producer = PRODUCERS[Math.floor(Math.random() * PRODUCERS.length)];
      const topic = TOPICS.find(t => t.name === producer.topic);

      if (topic) {
        const newMessage: Message = {
          id: `msg-${messageIdCounter.current++}`,
          partition: Math.floor(Math.random() * topic.partitions),
          offset: Date.now(),
          timestamp: Date.now(),
          data: `Event from ${producer.id}`,
          status: 'producing',
        };

        setMessages(prev => [...prev.slice(-20), newMessage]);
        setMetrics(prev => ({
          ...prev,
          totalMessages: prev.totalMessages + 1,
        }));
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Simulate message lifecycle
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev =>
        prev.map(msg => {
          if (msg.status === 'producing') return { ...msg, status: 'in-topic' as const };
          if (msg.status === 'in-topic' && Math.random() > 0.3) return { ...msg, status: 'consuming' as const };
          if (msg.status === 'consuming') return { ...msg, status: 'consumed' as const };
          return msg;
        }).filter(msg => msg.status !== 'consumed' || Date.now() - msg.timestamp < 2000)
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Calculate metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const recentMessages = messages.filter(m => Date.now() - m.timestamp < 1000);
      setMetrics(prev => ({
        ...prev,
        messagesPerSec: recentMessages.length,
        avgLatency: 35 + Math.random() * 30,
      }));

      // Simulate consumer lag
      const lags: ConsumerLag[] = [];
      TOPICS.forEach(topic => {
        for (let i = 0; i < topic.partitions; i++) {
          lags.push({
            groupId: CONSUMER_GROUPS[Math.floor(Math.random() * CONSUMER_GROUPS.length)].id,
            partition: i,
            lag: Math.floor(Math.random() * 150),
          });
        }
      });
      setConsumerLag(lags);
    }, 2000);

    return () => clearInterval(interval);
  }, [messages]);

  // Simulate rebalancing
  const triggerRebalance = () => {
    setIsRebalancing(true);
    setTimeout(() => setIsRebalancing(false), 3000);
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-400" />
              Live Kafka Cluster
            </h2>
            <p className="text-slate-400">Real-time event streaming visualization</p>
          </div>
          <button
            onClick={triggerRebalance}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Trigger Rebalance
          </button>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Messages</p>
                <p className="text-2xl font-bold text-white">{metrics.totalMessages.toLocaleString()}</p>
              </div>
              <Database className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Throughput</p>
                <p className="text-2xl font-bold text-white">{metrics.messagesPerSec}/s</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Latency</p>
                <p className="text-2xl font-bold text-white">{metrics.avgLatency.toFixed(0)}ms</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Consumer Groups</p>
                <p className="text-2xl font-bold text-white">{CONSUMER_GROUPS.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>
        </div>

        {isRebalancing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 flex items-center gap-2 mb-4"
          >
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-200">Consumer group rebalancing in progress...</span>
          </motion.div>
        )}
      </div>

      {/* Kafka Architecture Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Producers */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Producers
          </h3>
          <div className="space-y-3">
            {PRODUCERS.map((producer) => (
              <motion.div
                key={producer.id}
                className="bg-slate-800/70 rounded-lg p-4 border border-slate-700"
                whileHover={{ scale: 1.02, borderColor: '#10b981' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{producer.id}</span>
                  <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded">
                    {producer.rate}/s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-slate-400">→ {producer.topic}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Topics
          </h3>
          <div className="space-y-3">
            {TOPICS.map((topic) => (
              <motion.div
                key={topic.name}
                className={`bg-slate-800/70 rounded-lg p-4 border cursor-pointer transition-colors ${
                  selectedTopic === topic.name ? 'border-blue-400' : 'border-slate-700'
                }`}
                onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{topic.name}</span>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                    {topic.partitions} partitions
                  </span>
                </div>

                {/* Partitions */}
                <div className="space-y-2">
                  {Array.from({ length: topic.partitions }).map((_, idx) => {
                    const partitionMessages = messages.filter(
                      m => m.partition === idx && m.status === 'in-topic'
                    );
                    const lag = consumerLag.find(l => l.partition === idx)?.lag || 0;

                    return (
                      <div key={idx} className="bg-slate-900/50 rounded p-2">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-slate-400 shrink-0">Partition {idx}</span>
                            <div className="flex gap-1 overflow-x-auto">
                              <AnimatePresence>
                                {partitionMessages.slice(0, 8).map((msg) => (
                                  <motion.div
                                    key={msg.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: topic.color }}
                                  />
                                ))}
                              </AnimatePresence>
                            </div>
                          </div>
                          <span className={`shrink-0 ${lag > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                            Lag: {lag}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Consumers */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Consumer Groups
          </h3>
          <div className="space-y-3">
            {CONSUMER_GROUPS.map((group) => (
              <motion.div
                key={group.id}
                className="bg-slate-800/70 rounded-lg p-4 border border-slate-700"
                whileHover={{ scale: 1.02, borderColor: group.color }}
                animate={isRebalancing ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 0.5, repeat: isRebalancing ? Infinity : 0 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{group.id}</span>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  {group.topics.map((topic) => (
                    <div key={topic} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-purple-400" />
                      <span className="text-xs text-slate-400">{topic}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status</span>
                    <span className="text-emerald-400">Active</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Message Flow */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          Live Message Stream
        </h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          <AnimatePresence>
            {messages.slice(-10).reverse().map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 text-xs py-1"
              >
                <span className={`px-2 py-1 rounded font-mono ${
                  msg.status === 'producing' ? 'bg-yellow-500/20 text-yellow-300' :
                  msg.status === 'in-topic' ? 'bg-blue-500/20 text-blue-300' :
                  msg.status === 'consuming' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {msg.status}
                </span>
                <span className="text-slate-400">{msg.data}</span>
                <span className="text-slate-500 ml-auto">partition:{msg.partition}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 text-center text-sm text-slate-400">
        <p>Simulating Kafka cluster with {TOPICS.reduce((acc, t) => acc + t.partitions, 0)} partitions across {TOPICS.length} topics</p>
      </div>
    </div>
  );
}
