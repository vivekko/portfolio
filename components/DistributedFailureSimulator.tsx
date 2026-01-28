'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Shield, Zap, RefreshCw, Server, Database,
    Globe, CheckCircle2, XCircle, Clock, TrendingUp, Activity,
    Play, Pause, RotateCcw, AlertCircle
} from 'lucide-react';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface Service {
    id: string;
    name: string;
    icon: React.ReactNode;
    status: 'healthy' | 'degraded' | 'failing';
    circuitState: CircuitState;
    failureCount: number;
    successCount: number;
    lastFailure: number | null;
    bulkheadCapacity: number;
    bulkheadUsed: number;
}

interface Request {
    id: string;
    fromService: string;
    toService: string;
    status: 'pending' | 'success' | 'failed' | 'circuit_open' | 'retrying';
    attempt: number;
    maxAttempts: number;
    timestamp: number;
    retryDelay?: number;
}

const CIRCUIT_BREAKER_THRESHOLD = 3; // failures before opening
const CIRCUIT_RECOVERY_TIME = 5000; // ms before half-open
const MAX_RETRIES = 4;

const initialServices: Service[] = [
    { id: 'gateway', name: 'API Gateway', icon: <Globe className="w-5 h-5" />, status: 'healthy', circuitState: 'CLOSED', failureCount: 0, successCount: 0, lastFailure: null, bulkheadCapacity: 10, bulkheadUsed: 0 },
    { id: 'auth', name: 'Auth Service', icon: <Shield className="w-5 h-5" />, status: 'healthy', circuitState: 'CLOSED', failureCount: 0, successCount: 0, lastFailure: null, bulkheadCapacity: 8, bulkheadUsed: 0 },
    { id: 'orders', name: 'Order Service', icon: <Activity className="w-5 h-5" />, status: 'healthy', circuitState: 'CLOSED', failureCount: 0, successCount: 0, lastFailure: null, bulkheadCapacity: 12, bulkheadUsed: 0 },
    { id: 'payments', name: 'Payment Service', icon: <Zap className="w-5 h-5" />, status: 'healthy', circuitState: 'CLOSED', failureCount: 0, successCount: 0, lastFailure: null, bulkheadCapacity: 6, bulkheadUsed: 0 },
    { id: 'database', name: 'Database', icon: <Database className="w-5 h-5" />, status: 'healthy', circuitState: 'CLOSED', failureCount: 0, successCount: 0, lastFailure: null, bulkheadCapacity: 20, bulkheadUsed: 0 },
];

const serviceConnections = [
    { from: 'gateway', to: 'auth' },
    { from: 'gateway', to: 'orders' },
    { from: 'orders', to: 'payments' },
    { from: 'orders', to: 'database' },
    { from: 'payments', to: 'database' },
    { from: 'auth', to: 'database' },
];

export default function DistributedFailureSimulator() {
    const [services, setServices] = useState<Service[]>(initialServices);
    const [requests, setRequests] = useState<Request[]>([]);
    const [isRunning, setIsRunning] = useState(true);
    const [failingServiceId, setFailingServiceId] = useState<string | null>(null);
    const [retryTimeline, setRetryTimeline] = useState<{ attempt: number; delay: number; status: 'pending' | 'failed' | 'success' }[]>([]);
    const [metrics, setMetrics] = useState({
        totalRequests: 0,
        successRate: 100,
        circuitBreaks: 0,
        retries: 0,
    });
    const requestIdCounter = useRef(0);

    // Get circuit state color
    const getCircuitColor = (state: CircuitState) => {
        switch (state) {
            case 'CLOSED': return 'bg-emerald-500';
            case 'OPEN': return 'bg-red-500';
            case 'HALF_OPEN': return 'bg-yellow-500';
        }
    };

    // Calculate exponential backoff with jitter
    const getRetryDelay = (attempt: number) => {
        const baseDelay = 1000;
        const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 500;
        return Math.min(exponentialDelay + jitter, 8000);
    };

    // Inject failure into a service
    const injectFailure = (serviceId: string) => {
        if (failingServiceId === serviceId) {
            setFailingServiceId(null);
            setServices(prev => prev.map(s =>
                s.id === serviceId ? { ...s, status: 'healthy' } : s
            ));
        } else {
            setFailingServiceId(serviceId);
            setServices(prev => prev.map(s =>
                s.id === serviceId ? { ...s, status: 'failing' } : s
            ));
        }
    };

    // Reset simulation
    const resetSimulation = () => {
        setServices(initialServices);
        setRequests([]);
        setFailingServiceId(null);
        setRetryTimeline([]);
        setMetrics({ totalRequests: 0, successRate: 100, circuitBreaks: 0, retries: 0 });
    };

    // Generate requests
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            const connection = serviceConnections[Math.floor(Math.random() * serviceConnections.length)];
            const targetService = services.find(s => s.id === connection.to);

            if (!targetService) return;

            // Check circuit breaker
            if (targetService.circuitState === 'OPEN') {
                const newRequest: Request = {
                    id: `req-${requestIdCounter.current++}`,
                    fromService: connection.from,
                    toService: connection.to,
                    status: 'circuit_open',
                    attempt: 1,
                    maxAttempts: 1,
                    timestamp: Date.now(),
                };
                setRequests(prev => [...prev.slice(-20), newRequest]);
                return;
            }

            const newRequest: Request = {
                id: `req-${requestIdCounter.current++}`,
                fromService: connection.from,
                toService: connection.to,
                status: 'pending',
                attempt: 1,
                maxAttempts: MAX_RETRIES,
                timestamp: Date.now(),
            };

            setRequests(prev => [...prev.slice(-20), newRequest]);
            setMetrics(prev => ({ ...prev, totalRequests: prev.totalRequests + 1 }));
        }, 800);

        return () => clearInterval(interval);
    }, [isRunning, services]);

    // Process requests and update circuit breakers
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setRequests(prev => prev.map(req => {
                if (req.status !== 'pending' && req.status !== 'retrying') return req;

                const targetService = services.find(s => s.id === req.toService);
                if (!targetService) return req;

                const willFail = targetService.id === failingServiceId;

                if (willFail) {
                    // Update failure count
                    setServices(prevServices => prevServices.map(s => {
                        if (s.id !== req.toService) return s;

                        const newFailureCount = s.failureCount + 1;
                        let newCircuitState = s.circuitState;

                        // Trip circuit breaker
                        if (newFailureCount >= CIRCUIT_BREAKER_THRESHOLD && s.circuitState === 'CLOSED') {
                            newCircuitState = 'OPEN';
                            setMetrics(m => ({ ...m, circuitBreaks: m.circuitBreaks + 1 }));
                        }

                        return {
                            ...s,
                            failureCount: newFailureCount,
                            lastFailure: Date.now(),
                            circuitState: newCircuitState,
                            status: 'failing',
                        };
                    }));

                    // Retry logic
                    if (req.attempt < req.maxAttempts) {
                        const delay = getRetryDelay(req.attempt);
                        setMetrics(m => ({ ...m, retries: m.retries + 1 }));
                        setRetryTimeline(prev => [...prev.slice(-6), {
                            attempt: req.attempt,
                            delay: Math.round(delay / 1000),
                            status: 'failed'
                        }]);
                        return { ...req, status: 'retrying' as const, attempt: req.attempt + 1, retryDelay: delay };
                    }

                    return { ...req, status: 'failed' as const };
                }

                // Success
                setServices(prevServices => prevServices.map(s => {
                    if (s.id !== req.toService) return s;

                    let newCircuitState = s.circuitState;
                    if (s.circuitState === 'HALF_OPEN') {
                        newCircuitState = 'CLOSED';
                    }

                    return {
                        ...s,
                        successCount: s.successCount + 1,
                        failureCount: 0,
                        circuitState: newCircuitState,
                        status: 'healthy',
                    };
                }));

                return { ...req, status: 'success' as const };
            }).filter(req => Date.now() - req.timestamp < 10000));

            // Update success rate
            const recentRequests = requests.filter(r => Date.now() - r.timestamp < 5000);
            const successCount = recentRequests.filter(r => r.status === 'success').length;
            const totalRecent = recentRequests.length || 1;
            setMetrics(prev => ({
                ...prev,
                successRate: Math.round((successCount / totalRecent) * 100)
            }));
        }, 400);

        return () => clearInterval(interval);
    }, [isRunning, services, failingServiceId, requests]);

    // Circuit recovery timer
    useEffect(() => {
        const interval = setInterval(() => {
            setServices(prev => prev.map(s => {
                if (s.circuitState === 'OPEN' && s.lastFailure && Date.now() - s.lastFailure > CIRCUIT_RECOVERY_TIME) {
                    return { ...s, circuitState: 'HALF_OPEN' };
                }
                return s;
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <AlertTriangle className="w-8 h-8 text-orange-400" />
                            Failure Modes Simulator
                        </h2>
                        <p className="text-slate-400">Click any service to inject failures and observe resilience patterns</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsRunning(!isRunning)}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isRunning
                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                        >
                            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {isRunning ? 'Pause' : 'Resume'}
                        </button>
                        <button
                            onClick={resetSimulation}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Metrics Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <motion.div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700" whileHover={{ scale: 1.02 }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Total Requests</p>
                                <p className="text-2xl font-bold text-white">{metrics.totalRequests}</p>
                            </div>
                            <Activity className="w-8 h-8 text-blue-400" />
                        </div>
                    </motion.div>

                    <motion.div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700" whileHover={{ scale: 1.02 }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Success Rate</p>
                                <p className={`text-2xl font-bold ${metrics.successRate > 80 ? 'text-emerald-400' : metrics.successRate > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {metrics.successRate}%
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                        </div>
                    </motion.div>

                    <motion.div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700" whileHover={{ scale: 1.02 }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Circuit Breaks</p>
                                <p className="text-2xl font-bold text-orange-400">{metrics.circuitBreaks}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-orange-400" />
                        </div>
                    </motion.div>

                    <motion.div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700" whileHover={{ scale: 1.02 }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Retries</p>
                                <p className="text-2xl font-bold text-purple-400">{metrics.retries}</p>
                            </div>
                            <RefreshCw className="w-8 h-8 text-purple-400" />
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Service Architecture */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-blue-400" />
                        Microservice Architecture
                        <span className="text-xs text-slate-500 ml-2">(click to inject failure)</span>
                    </h3>
                    <div className="space-y-3">
                        {services.map((service) => (
                            <motion.div
                                key={service.id}
                                onClick={() => injectFailure(service.id)}
                                className={`bg-slate-800/70 rounded-lg p-4 border-2 cursor-pointer transition-all ${service.id === failingServiceId
                                        ? 'border-red-500 bg-red-500/10'
                                        : service.circuitState === 'OPEN'
                                            ? 'border-orange-500'
                                            : 'border-slate-700 hover:border-slate-500'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                animate={service.id === failingServiceId ? {
                                    x: [0, -2, 2, -2, 0],
                                } : {}}
                                transition={{ duration: 0.3, repeat: service.id === failingServiceId ? Infinity : 0, repeatDelay: 0.5 }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${service.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                                                service.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {service.icon}
                                        </div>
                                        <div>
                                            <span className="text-white font-medium">{service.name}</span>
                                            {service.id === failingServiceId && (
                                                <span className="text-xs text-red-400 ml-2 animate-pulse">⚠ Failing</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Circuit Breaker State */}
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${getCircuitColor(service.circuitState)}`} />
                                        <span className="text-xs text-slate-400">{service.circuitState.replace('_', '-')}</span>
                                    </div>
                                </div>

                                {/* Bulkhead Visualization */}
                                <div className="mb-2">
                                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                        <span>Bulkhead Pool</span>
                                        <span>{service.bulkheadUsed}/{service.bulkheadCapacity}</span>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: service.bulkheadCapacity }).map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-2 flex-1 rounded-sm ${idx < service.bulkheadUsed ? 'bg-blue-500' : 'bg-slate-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Failure/Success Counts */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-emerald-400">✓ {service.successCount}</span>
                                    <span className="text-red-400">✗ {service.failureCount}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-6">
                    {/* Circuit Breaker State Machine */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            Circuit Breaker Pattern
                        </h3>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between gap-2 mb-4">
                                {(['CLOSED', 'OPEN', 'HALF_OPEN'] as CircuitState[]).map((state, idx) => {
                                    const activeServices = services.filter(s => s.circuitState === state);
                                    return (
                                        <motion.div
                                            key={state}
                                            className={`flex-1 p-3 rounded-lg text-center ${state === 'CLOSED' ? 'bg-emerald-500/20 border border-emerald-500/50' :
                                                    state === 'OPEN' ? 'bg-red-500/20 border border-red-500/50' :
                                                        'bg-yellow-500/20 border border-yellow-500/50'
                                                }`}
                                            animate={activeServices.length > 0 ? { scale: [1, 1.02, 1] } : {}}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            <div className={`text-sm font-bold mb-1 ${state === 'CLOSED' ? 'text-emerald-400' :
                                                    state === 'OPEN' ? 'text-red-400' :
                                                        'text-yellow-400'
                                                }`}>
                                                {state.replace('_', '-')}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {activeServices.length} services
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <div className="text-xs text-slate-500 text-center">
                                {CIRCUIT_BREAKER_THRESHOLD} failures → OPEN | {CIRCUIT_RECOVERY_TIME / 1000}s → HALF-OPEN | 1 success → CLOSED
                            </div>
                        </div>
                    </div>

                    {/* Retry Timeline */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-purple-400" />
                            Exponential Backoff + Jitter
                        </h3>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-end gap-2 h-24 mb-3">
                                {[1, 2, 4, 8].map((delay, idx) => {
                                    const timelineItem = retryTimeline[retryTimeline.length - 1];
                                    const isActive = timelineItem && timelineItem.attempt === idx + 1;
                                    return (
                                        <motion.div
                                            key={idx}
                                            className="flex-1 flex flex-col items-center"
                                            initial={{ opacity: 0.5 }}
                                            animate={{ opacity: isActive ? 1 : 0.5 }}
                                        >
                                            <motion.div
                                                className={`w-full rounded-t ${isActive
                                                        ? timelineItem.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                                                        : 'bg-slate-600'
                                                    }`}
                                                style={{ height: `${delay * 10}px` }}
                                                animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
                                                transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                                            />
                                            <div className="text-xs text-slate-400 mt-1">{delay}s</div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <div className="text-xs text-slate-500 text-center">
                                delay = min(base × 2^attempt + jitter, 8s)
                            </div>
                        </div>
                    </div>

                    {/* Live Request Stream */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                            Live Request Stream
                        </h3>
                        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700 max-h-40 overflow-y-auto">
                            <AnimatePresence mode="popLayout">
                                {requests.slice(-6).reverse().map((req) => (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center gap-2 text-xs py-1.5 border-b border-slate-700/50 last:border-0"
                                    >
                                        <span className="text-slate-500">{req.fromService}</span>
                                        <span className="text-slate-600">→</span>
                                        <span className="text-slate-400">{req.toService}</span>
                                        <span className={`ml-auto px-2 py-0.5 rounded flex items-center gap-1 ${req.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' :
                                                req.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                                                    req.status === 'circuit_open' ? 'bg-orange-500/20 text-orange-300' :
                                                        req.status === 'retrying' ? 'bg-purple-500/20 text-purple-300' :
                                                            'bg-blue-500/20 text-blue-300'
                                            }`}>
                                            {req.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                                            {req.status === 'failed' && <XCircle className="w-3 h-3" />}
                                            {req.status === 'circuit_open' && <AlertCircle className="w-3 h-3" />}
                                            {req.status === 'retrying' && <RefreshCw className="w-3 h-3 animate-spin" />}
                                            {req.status === 'pending' && <Clock className="w-3 h-3" />}
                                            {req.status}
                                            {req.attempt > 1 && ` (${req.attempt}/${req.maxAttempts})`}
                                        </span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-6 text-center text-sm text-slate-400">
                <p>Demonstrating circuit breakers, bulkhead isolation, and retry patterns for distributed system resilience</p>
            </div>
        </div>
    );
}
