'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, MessageSquare, Cog, Search, Code, Database,
    CheckCircle2, Loader2, Sparkles, ArrowRight, Play,
    RotateCcw, Zap, Eye, Terminal
} from 'lucide-react';

type StepType = 'thinking' | 'tool_call' | 'observation' | 'response';
type ToolType = 'search' | 'code' | 'database' | 'api';

interface ReasoningStep {
    id: string;
    type: StepType;
    content: string;
    tool?: ToolType;
    toolInput?: string;
    toolOutput?: string;
    timestamp: number;
    status: 'pending' | 'active' | 'complete';
}

interface AgentQuery {
    id: string;
    query: string;
    steps: ReasoningStep[];
    status: 'idle' | 'thinking' | 'complete';
}

const SAMPLE_QUERIES = [
    "What's the weather in Tokyo and should I bring an umbrella?",
    "Find the latest stock price for AAPL and calculate 10% gain",
    "Search for Python tutorials and summarize the top result",
    "Query our database for users created this week",
];

const TOOL_ICONS: Record<ToolType, React.ReactNode> = {
    search: <Search className="w-4 h-4" />,
    code: <Code className="w-4 h-4" />,
    database: <Database className="w-4 h-4" />,
    api: <Zap className="w-4 h-4" />,
};

const TOOL_COLORS: Record<ToolType, string> = {
    search: 'from-blue-500 to-cyan-500',
    code: 'from-green-500 to-emerald-500',
    database: 'from-purple-500 to-pink-500',
    api: 'from-orange-500 to-yellow-500',
};

export default function LLMAgentVisualizer() {
    const [currentQuery, setCurrentQuery] = useState<AgentQuery | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState(SAMPLE_QUERIES[0]);
    const [metrics, setMetrics] = useState({
        totalQueries: 0,
        toolCalls: 0,
        avgLatency: 0,
        tokensUsed: 0,
    });
    const stepCounter = useRef(0);

    const generateReasoningChain = async (query: string) => {
        const steps: ReasoningStep[] = [];

        // Step 1: Initial Thinking
        steps.push({
            id: `step-${stepCounter.current++}`,
            type: 'thinking',
            content: `Analyzing the user's request: "${query}"\n\nI need to break this down into actionable steps...`,
            timestamp: Date.now(),
            status: 'pending',
        });

        // Determine which tools to use based on query
        if (query.toLowerCase().includes('weather')) {
            steps.push({
                id: `step-${stepCounter.current++}`,
                type: 'tool_call',
                content: 'I need to fetch current weather data.',
                tool: 'api',
                toolInput: 'GET /api/weather?city=Tokyo',
                timestamp: Date.now(),
                status: 'pending',
            });
            steps.push({
                id: `step-${stepCounter.current++}`,
                type: 'observation',
                content: '',
                toolOutput: '{"temp": 18, "condition": "Cloudy", "rain_chance": 75%, "humidity": 80%}',
                timestamp: Date.now(),
                status: 'pending',
            });
        } else if (query.toLowerCase().includes('stock') || query.toLowerCase().includes('calculate')) {
            steps.push({
                id: `step-${stepCounter.current++}`,
                type: 'tool_call',
                content: 'Fetching stock data from financial API.',
                tool: 'api',
                toolInput: 'GET /api/stocks/AAPL',
                timestamp: Date.now(),
                status: 'pending',
            });
            steps.push({
                id: `step-${stepCounter.current++}`,
                type: 'observation',
                content: '',
                toolOutput: '{"symbol": "AAPL", "price": 178.52, "change": "+1.2%"}',
                timestamp: Date.now(),
                status: 'pending',
            });
            steps.push({
                id: `step-${stepCounter.current++}`,
                type: 'tool_call',
                content: 'Executing calculation for 10% gain.',
                tool: 'code',
                toolInput: 'price = 178.52\ngain_10_percent = price * 1.10\nprint(f"10% gain: ${gain_10_percent:.2f}")',
                timestamp: Date.now(),
                status: 'pending',
            });
            steps.push({
                id: `step-${stepCounter.current++}`,
                type: 'observation',
                content: '',
                toolOutput: '10% gain: $196.37',
                timestamp: Date.now(),
                status: 'pending',
            });
        } else if (query.toLowerCase().includes('search') || query.toLowerCase().includes('find')) {
            steps.push({
                id: `step-${stepCounter.current++}`,
                type: 'tool_call',
                content: 'Searching the web for relevant information.',
                tool: 'search',
                toolInput: 'Python tutorials 2024 best beginner',
                timestamp: Date.now(),
                status: 'pending',
            });
            steps.push({
                id: `step-${stepCounter.current++}`,
                type: 'observation',
                content: '',
                toolOutput: '[1] "Python Tutorial - W3Schools" - Comprehensive guide...\n[2] "Learn Python - Codecademy" - Interactive lessons...\n[3] "Python for Beginners - Real Python" - In-depth articles...',
                timestamp: Date.now(),
                status: 'pending',
            });
        } else if (query.toLowerCase().includes('database') || query.toLowerCase().includes('query')) {
            steps.push({
                id: `step-${stepCounter.current++}`,
                type: 'tool_call',
                content: 'Querying the database for user records.',
                tool: 'database',
                toolInput: "SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days'",
                timestamp: Date.now(),
                status: 'pending',
            });
            steps.push({
                id: `step-${stepCounter.current++}`,
                type: 'observation',
                content: '',
                toolOutput: '{"count": 147, "query_time_ms": 23}',
                timestamp: Date.now(),
                status: 'pending',
            });
        }

        // Step 2: Thinking after tool use
        steps.push({
            id: `step-${stepCounter.current++}`,
            type: 'thinking',
            content: 'Processing the retrieved information and formulating a comprehensive response...',
            timestamp: Date.now(),
            status: 'pending',
        });

        // Final response
        let finalResponse = '';
        if (query.toLowerCase().includes('weather')) {
            finalResponse = "Based on the weather data, Tokyo is currently cloudy at 18°C with a 75% chance of rain. I recommend bringing an umbrella! ☔";
        } else if (query.toLowerCase().includes('stock')) {
            finalResponse = "AAPL is currently trading at $178.52 (+1.2% today). A 10% gain would bring the price to $196.37. 📈";
        } else if (query.toLowerCase().includes('search')) {
            finalResponse = "I found several great Python tutorials! W3Schools offers a comprehensive guide, Codecademy has interactive lessons, and Real Python provides in-depth articles. I'd recommend starting with W3Schools for basics. 🐍";
        } else {
            finalResponse = "Based on the database query, 147 new users have been created in the last 7 days. The query executed in just 23ms. 📊";
        }

        steps.push({
            id: `step-${stepCounter.current++}`,
            type: 'response',
            content: finalResponse,
            timestamp: Date.now(),
            status: 'pending',
        });

        return steps;
    };

    const runAgent = async () => {
        if (isRunning) return;

        setIsRunning(true);
        const steps = await generateReasoningChain(selectedQuery);

        const newQuery: AgentQuery = {
            id: `query-${Date.now()}`,
            query: selectedQuery,
            steps: [],
            status: 'thinking',
        };

        setCurrentQuery(newQuery);
        setMetrics(prev => ({ ...prev, totalQueries: prev.totalQueries + 1 }));

        // Animate through steps
        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));

            const step = { ...steps[i], status: 'active' as const };

            setCurrentQuery(prev => prev ? {
                ...prev,
                steps: [...prev.steps, step],
            } : null);

            if (step.type === 'tool_call') {
                setMetrics(prev => ({ ...prev, toolCalls: prev.toolCalls + 1 }));
            }

            await new Promise(resolve => setTimeout(resolve, 600));

            setCurrentQuery(prev => prev ? {
                ...prev,
                steps: prev.steps.map(s =>
                    s.id === step.id ? { ...s, status: 'complete' as const } : s
                ),
            } : null);
        }

        setCurrentQuery(prev => prev ? { ...prev, status: 'complete' } : null);
        setMetrics(prev => ({
            ...prev,
            avgLatency: Math.round(800 + Math.random() * 400),
            tokensUsed: prev.tokensUsed + Math.round(500 + Math.random() * 500),
        }));
        setIsRunning(false);
    };

    const reset = () => {
        setCurrentQuery(null);
        setIsRunning(false);
    };

    const getStepIcon = (step: ReasoningStep) => {
        switch (step.type) {
            case 'thinking':
                return <Brain className="w-5 h-5" />;
            case 'tool_call':
                return step.tool ? TOOL_ICONS[step.tool] : <Cog className="w-5 h-5" />;
            case 'observation':
                return <Eye className="w-5 h-5" />;
            case 'response':
                return <MessageSquare className="w-5 h-5" />;
        }
    };

    const getStepColor = (step: ReasoningStep) => {
        switch (step.type) {
            case 'thinking':
                return 'border-purple-500 bg-purple-500/10';
            case 'tool_call':
                return step.tool ? `border-blue-500 bg-blue-500/10` : 'border-slate-500 bg-slate-500/10';
            case 'observation':
                return 'border-yellow-500 bg-yellow-500/10';
            case 'response':
                return 'border-emerald-500 bg-emerald-500/10';
        }
    };

    return (
        <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-purple-400" />
                            LLM Agent Reasoning
                        </h2>
                        <p className="text-slate-400">ReAct pattern: Reason → Act → Observe → Respond</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={runAgent}
                            disabled={isRunning}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isRunning ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                            {isRunning ? 'Running...' : 'Run Agent'}
                        </button>
                        <button
                            onClick={reset}
                            disabled={isRunning}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Query Selector */}
                <div className="mb-6">
                    <label className="text-sm text-slate-400 mb-2 block">Select a query:</label>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_QUERIES.map((query, idx) => (
                            <button
                                key={idx}
                                onClick={() => !isRunning && setSelectedQuery(query)}
                                disabled={isRunning}
                                className={`px-3 py-2 rounded-lg text-sm transition-all ${selectedQuery === query
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {query.length > 40 ? query.slice(0, 40) + '...' : query}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Metrics Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700" whileHover={{ scale: 1.02 }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Queries Run</p>
                                <p className="text-2xl font-bold text-white">{metrics.totalQueries}</p>
                            </div>
                            <MessageSquare className="w-8 h-8 text-purple-400" />
                        </div>
                    </motion.div>

                    <motion.div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700" whileHover={{ scale: 1.02 }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Tool Calls</p>
                                <p className="text-2xl font-bold text-blue-400">{metrics.toolCalls}</p>
                            </div>
                            <Cog className="w-8 h-8 text-blue-400" />
                        </div>
                    </motion.div>

                    <motion.div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700" whileHover={{ scale: 1.02 }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Avg Latency</p>
                                <p className="text-2xl font-bold text-emerald-400">{metrics.avgLatency}ms</p>
                            </div>
                            <Zap className="w-8 h-8 text-emerald-400" />
                        </div>
                    </motion.div>

                    <motion.div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700" whileHover={{ scale: 1.02 }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Tokens Used</p>
                                <p className="text-2xl font-bold text-orange-400">{metrics.tokensUsed.toLocaleString()}</p>
                            </div>
                            <Sparkles className="w-8 h-8 text-orange-400" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Agent Execution Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Query Display */}
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-400" />
                        User Query
                    </h3>
                    <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700">
                        <p className="text-slate-300">{selectedQuery}</p>
                        {currentQuery && (
                            <div className="mt-4 flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs ${currentQuery.status === 'complete'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-purple-500/20 text-purple-300'
                                    }`}>
                                    {currentQuery.status === 'complete' ? 'Complete' : 'Processing...'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tools Legend */}
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold text-slate-400 mb-3">Available Tools</h4>
                        <div className="space-y-2">
                            {(Object.entries(TOOL_ICONS) as [ToolType, React.ReactNode][]).map(([tool, icon]) => (
                                <div key={tool} className="flex items-center gap-2 text-sm">
                                    <div className={`p-1.5 rounded bg-gradient-to-r ${TOOL_COLORS[tool]} text-white`}>
                                        {icon}
                                    </div>
                                    <span className="text-slate-300 capitalize">{tool}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reasoning Chain */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        Reasoning Chain
                    </h3>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {!currentQuery && (
                            <div className="text-center py-12 text-slate-500">
                                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Click "Run Agent" to start the reasoning chain</p>
                            </div>
                        )}

                        <AnimatePresence mode="popLayout">
                            {currentQuery?.steps.map((step, idx) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20, height: 0 }}
                                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                                    exit={{ opacity: 0 }}
                                    className={`rounded-lg p-4 border-l-4 ${getStepColor(step)}`}
                                >
                                    {/* Step Header */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${step.type === 'thinking' ? 'bg-purple-500/20 text-purple-400' :
                                                step.type === 'tool_call' ? 'bg-blue-500/20 text-blue-400' :
                                                    step.type === 'observation' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {step.status === 'active' ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : step.status === 'complete' ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                getStepIcon(step)
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-white font-medium capitalize">
                                                {step.type === 'tool_call' ? `Tool: ${step.tool}` : step.type.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-slate-500 ml-2">Step {idx + 1}</span>
                                        </div>
                                        {idx < (currentQuery?.steps.length || 0) - 1 && (
                                            <ArrowRight className="w-4 h-4 text-slate-500 ml-auto" />
                                        )}
                                    </div>

                                    {/* Step Content */}
                                    {step.content && (
                                        <p className="text-slate-300 text-sm ml-11">{step.content}</p>
                                    )}

                                    {/* Tool Input */}
                                    {step.toolInput && (
                                        <div className="ml-11 mt-2">
                                            <div className="bg-slate-900/50 rounded p-2 font-mono text-xs text-slate-400">
                                                <div className="flex items-center gap-2 text-blue-400 mb-1">
                                                    <Terminal className="w-3 h-3" />
                                                    <span>Input:</span>
                                                </div>
                                                <pre className="whitespace-pre-wrap">{step.toolInput}</pre>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tool Output (Observation) */}
                                    {step.toolOutput && (
                                        <div className="ml-11 mt-2">
                                            <div className="bg-slate-900/50 rounded p-2 font-mono text-xs">
                                                <div className="flex items-center gap-2 text-yellow-400 mb-1">
                                                    <Eye className="w-3 h-3" />
                                                    <span>Output:</span>
                                                </div>
                                                <pre className="whitespace-pre-wrap text-emerald-300">{step.toolOutput}</pre>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-6 text-center text-sm text-slate-400">
                <p>Demonstrating the ReAct (Reason + Act) pattern for LLM agents with tool use</p>
            </div>
        </div>
    );
}
