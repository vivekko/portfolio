'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IdempotencyVisualizer from './IdempotencyVisualizer';
import DatabaseShardingVisualizer from './DatabaseShardingVisualizer';
import KafkaVisualizer from './KafkaVisualizer';
import DistributedFailureSimulator from './DistributedFailureSimulator';
import LLMAgentVisualizer from './LLMAgentVisualizer';

type Tab = 'llm' | 'idempotency' | 'sharding' | 'kafka' | 'failure';

interface TabConfig {
    id: Tab;
    label: string;
    description: string;
}

const TABS: TabConfig[] = [
    { id: 'llm', label: 'LLM agents', description: 'Reasoning chains and tool use' },
    { id: 'idempotency', label: 'Idempotency keys', description: 'Safe request deduplication' },
    { id: 'sharding', label: 'Database sharding', description: 'Horizontal scaling under load' },
    { id: 'kafka', label: 'Event streaming', description: 'A Kafka cluster in real time' },
    { id: 'failure', label: 'Failure modes', description: 'Circuit breakers and resilience' },
];

export default function VisualizerTabs() {
    const [activeTab, setActiveTab] = useState<Tab>('llm');
    const active = TABS.find((t) => t.id === activeTab);

    return (
        <div className="w-full">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div
                    role="tablist"
                    className="flex gap-1 overflow-x-auto border-b border-line"
                >
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            data-cursor={activeTab === tab.id ? undefined : 'run'}
                            className={`relative whitespace-nowrap px-4 py-3 font-mono text-xs transition-colors duration-300 ${
                                activeTab === tab.id ? 'text-bone' : 'text-mist hover:text-bone'
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.span
                                    layoutId="model-tab-underline"
                                    className="absolute inset-x-2 -bottom-px h-px bg-signal"
                                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
                <AnimatePresence mode="wait">
                    <motion.p
                        key={activeTab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0 text-xs text-mist"
                    >
                        {active?.description}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* the model runs inside a framed screen */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden rounded-lg border border-line"
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
