'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Database, Activity, AlertTriangle, Brain } from 'lucide-react';
import IdempotencyVisualizer from './IdempotencyVisualizer';
import DatabaseShardingVisualizer from './DatabaseShardingVisualizer';
import KafkaVisualizer from './KafkaVisualizer';
import DistributedFailureSimulator from './DistributedFailureSimulator';
import LLMAgentVisualizer from './LLMAgentVisualizer';

type Tab = 'llm' | 'idempotency' | 'sharding' | 'kafka' | 'failure';

interface TabConfig {
    id: Tab;
    label: string;
    icon: React.ReactNode;
    gradient: string;
    description: string;
}

const TABS: TabConfig[] = [
    {
        id: 'llm',
        label: 'LLM Agents',
        icon: <Brain className="w-5 h-5" />,
        gradient: 'from-pink-500 to-purple-600',
        description: 'AI reasoning chains & tool use',
    },
    {
        id: 'idempotency',
        label: 'Idempotency Keys',
        icon: <Key className="w-5 h-5" />,
        gradient: 'from-purple-500 to-pink-500',
        description: 'Safe request deduplication',
    },
    {
        id: 'sharding',
        label: 'Database Sharding',
        icon: <Database className="w-5 h-5" />,
        gradient: 'from-blue-500 to-cyan-500',
        description: 'Horizontal scalability',
    },
    {
        id: 'kafka',
        label: 'Event Streaming',
        icon: <Activity className="w-5 h-5" />,
        gradient: 'from-emerald-500 to-teal-500',
        description: 'Real-time Kafka cluster',
    },
    {
        id: 'failure',
        label: 'Failure Modes',
        icon: <AlertTriangle className="w-5 h-5" />,
        gradient: 'from-orange-500 to-red-500',
        description: 'Circuit breakers & resilience patterns',
    },
];

export default function VisualizerTabs() {
    const [activeTab, setActiveTab] = useState<Tab>('llm');

    return (
        <div className="w-full">
            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="flex flex-wrap justify-center gap-3">
                    {TABS.map((tab) => (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${activeTab === tab.id
                                ? 'text-white shadow-lg'
                                : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
                                }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabBg"
                                    className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl`}
                                    initial={false}
                                    transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* Active Tab Description */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-center text-slate-500 text-sm mt-4"
                    >
                        {TABS.find(t => t.id === activeTab)?.description}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    {activeTab === 'llm' && <LLMAgentVisualizer />}
                    {activeTab === 'idempotency' && <IdempotencyVisualizer />}
                    {activeTab === 'sharding' && <DatabaseShardingVisualizer />}
                    {activeTab === 'kafka' && <KafkaVisualizer />}
                    {activeTab === 'failure' && <DistributedFailureSimulator />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
