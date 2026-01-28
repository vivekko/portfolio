'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Shield, RefreshCw, CheckCircle2, XCircle, Clock, Zap, TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';

interface Request {
  id: string;
  idempotencyKey: string;
  endpoint: string;
  method: 'POST' | 'PUT';
  status: 'pending' | 'processing' | 'completed' | 'duplicate' | 'failed';
  timestamp: number;
  isRetry: boolean;
  amount?: number;
}

interface StoredKey {
  key: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
  expiresAt: number;
  response?: string;
}

const ENDPOINTS = [
  { path: '/api/payments', method: 'POST' as const, color: '#10b981' },
  { path: '/api/orders', method: 'POST' as const, color: '#3b82f6' },
  { path: '/api/transfers', method: 'POST' as const, color: '#f59e0b' },
];

export default function IdempotencyVisualizer() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [storedKeys, setStoredKeys] = useState<StoredKey[]>([]);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    duplicatesBlocked: 0,
    keysStored: 0,
    avgResponseTime: 45,
  });
  const [showRetrySimulation, setShowRetrySimulation] = useState(false);
  const requestIdCounter = useRef(0);

  // Generate unique idempotency key
  const generateKey = () => {
    return `idem_${Math.random().toString(36).substring(2, 10)}`;
  };

  // Simulate incoming requests
  useEffect(() => {
    const interval = setInterval(() => {
      const endpoint = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
      const isRetry = Math.random() > 0.7 && storedKeys.length > 0;
      
      let idempotencyKey: string;
      if (isRetry && storedKeys.length > 0) {
        // Use existing key (simulating retry)
        const existingKey = storedKeys[Math.floor(Math.random() * storedKeys.length)];
        idempotencyKey = existingKey.key;
      } else {
        idempotencyKey = generateKey();
      }

      const newRequest: Request = {
        id: `req-${requestIdCounter.current++}`,
        idempotencyKey,
        endpoint: endpoint.path,
        method: endpoint.method,
        status: 'pending',
        timestamp: Date.now(),
        isRetry,
        amount: Math.floor(Math.random() * 1000) + 100,
      };

      setRequests(prev => [...prev.slice(-15), newRequest]);
      setMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
      }));
    }, 1200);

    return () => clearInterval(interval);
  }, [storedKeys]);

  // Process request lifecycle
  useEffect(() => {
    const interval = setInterval(() => {
      setRequests(prev =>
        prev.map(req => {
          if (req.status === 'pending') {
            // Check if key already exists
            const existingKey = storedKeys.find(k => k.key === req.idempotencyKey);
            
            if (existingKey && existingKey.status === 'completed') {
              // Duplicate detected - return cached response
              setMetrics(m => ({ ...m, duplicatesBlocked: m.duplicatesBlocked + 1 }));
              return { ...req, status: 'duplicate' as const };
            } else if (existingKey && existingKey.status === 'pending') {
              // Request still processing - wait
              return req;
            } else {
              // New request - store key and process
              if (!existingKey) {
                setStoredKeys(keys => [...keys.slice(-8), {
                  key: req.idempotencyKey,
                  status: 'pending',
                  createdAt: Date.now(),
                  expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
                }]);
                setMetrics(m => ({ ...m, keysStored: m.keysStored + 1 }));
              }
              return { ...req, status: 'processing' as const };
            }
          }
          
          if (req.status === 'processing') {
            const succeeded = Math.random() > 0.1;
            // Update stored key status
            setStoredKeys(keys =>
              keys.map(k =>
                k.key === req.idempotencyKey
                  ? { ...k, status: succeeded ? 'completed' : 'failed', response: succeeded ? 'OK' : 'Error' }
                  : k
              )
            );
            return { ...req, status: succeeded ? 'completed' as const : 'failed' as const };
          }
          
          return req;
        }).filter(req => Date.now() - req.timestamp < 8000)
      );
    }, 600);

    return () => clearInterval(interval);
  }, [storedKeys]);

  // Update metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        avgResponseTime: 35 + Math.random() * 30,
      }));

      // Clean expired keys
      setStoredKeys(keys => keys.filter(k => Date.now() < k.expiresAt));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Trigger retry simulation
  const triggerRetrySimulation = () => {
    setShowRetrySimulation(true);
    
    if (storedKeys.length > 0) {
      const keyToRetry = storedKeys[storedKeys.length - 1];
      const endpoint = ENDPOINTS[0];
      
      // Simulate multiple retries with same key
      [0, 500, 1000].forEach((delay, idx) => {
        setTimeout(() => {
          const retryRequest: Request = {
            id: `retry-${requestIdCounter.current++}`,
            idempotencyKey: keyToRetry.key,
            endpoint: endpoint.path,
            method: endpoint.method,
            status: 'pending',
            timestamp: Date.now(),
            isRetry: true,
            amount: 500,
          };
          setRequests(prev => [...prev.slice(-15), retryRequest]);
        }, delay);
      });
    }
    
    setTimeout(() => setShowRetrySimulation(false), 3000);
  };

  const getStatusIcon = (status: Request['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'duplicate': return <Shield className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      case 'processing': return 'bg-blue-500/20 text-blue-300';
      case 'completed': return 'bg-emerald-500/20 text-emerald-300';
      case 'duplicate': return 'bg-purple-500/20 text-purple-300';
      case 'failed': return 'bg-red-500/20 text-red-300';
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Key className="w-8 h-8 text-purple-400" />
              Idempotency Keys
            </h2>
            <p className="text-slate-400">Safe request deduplication for distributed systems</p>
          </div>
          <button
            onClick={triggerRetrySimulation}
            disabled={showRetrySimulation || storedKeys.length === 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${showRetrySimulation ? 'animate-spin' : ''}`} />
            {showRetrySimulation ? 'Simulating...' : 'Simulate Retry'}
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">How Idempotency Works</h4>
              <p className="text-slate-400 text-sm">
                Clients include a unique key with each request. If the same key is seen again,
                the server returns the cached response instead of processing twice. This prevents duplicate
                charges, orders, or any side effects from network retries.
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-white">{metrics.totalRequests.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Duplicates Blocked</p>
                <p className="text-2xl font-bold text-purple-400">{metrics.duplicatesBlocked}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Keys Stored</p>
                <p className="text-2xl font-bold text-white">{metrics.keysStored}</p>
              </div>
              <Key className="w-8 h-8 text-emerald-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Response</p>
                <p className="text-2xl font-bold text-white">{metrics.avgResponseTime.toFixed(0)}ms</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Request Flow */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
            Incoming Requests
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {requests.slice().reverse().map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="bg-slate-800/70 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded font-mono">
                        {req.method}
                      </span>
                      <span className="text-white text-sm font-medium">{req.endpoint}</span>
                      {req.isRetry && (
                        <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </span>
                      )}
                    </div>
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${getStatusColor(req.status)}`}>
                      {getStatusIcon(req.status)}
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Key className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-400 font-mono">{req.idempotencyKey}</span>
                    {req.amount && (
                      <span className="ml-auto text-slate-500">${req.amount}</span>
                    )}
                  </div>
                  {req.status === 'duplicate' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 text-xs text-purple-300 bg-purple-500/10 rounded p-2 flex items-center gap-2"
                    >
                      <Shield className="w-3 h-3" />
                      Duplicate detected! Returning cached response.
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {requests.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Waiting for requests...
              </div>
            )}
          </div>
        </div>

        {/* Key Store */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-400" />
            Idempotency Key Store
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {storedKeys.slice().reverse().map((key) => {
                const isExpiringSoon = key.expiresAt - Date.now() < 60000;
                return (
                  <motion.div
                    key={key.key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-slate-800/70 rounded-lg p-4 border transition-colors ${
                      key.status === 'completed' ? 'border-emerald-500/50' :
                      key.status === 'failed' ? 'border-red-500/50' :
                      'border-yellow-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-mono text-sm">{key.key}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        key.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                        key.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {key.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Created: {new Date(key.createdAt).toLocaleTimeString()}</span>
                      <span className={`flex items-center gap-1 ${isExpiringSoon ? 'text-orange-400' : ''}`}>
                        {isExpiringSoon && <AlertTriangle className="w-3 h-3" />}
                        TTL: 24h
                      </span>
                    </div>
                    {key.response && (
                      <div className="mt-2 text-xs bg-slate-900/50 rounded p-2">
                        <span className="text-slate-500">Cached Response:</span>
                        <span className="text-slate-300 ml-2">{key.response}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {storedKeys.length === 0 && (
              <div className="text-center text-slate-500 py-8">
                <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No keys stored yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Retry Alert */}
      <AnimatePresence>
        {showRetrySimulation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4 mb-6 flex items-center gap-3"
          >
            <Shield className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-purple-200 font-medium">Retry Simulation Active</p>
              <p className="text-purple-300/70 text-sm">
                Watch how duplicate requests with the same idempotency key are handled safely
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Footer */}
      <div className="mt-6 text-center text-sm text-slate-400">
        <p>Demonstrating idempotency key-based request deduplication for safe API retries</p>
      </div>
    </div>
  );
}
