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
  { path: '/api/payments', method: 'POST' as const, color: '#86B786' },
  { path: '/api/orders', method: 'POST' as const, color: '#6FA8B0' },
  { path: '/api/transfers', method: 'POST' as const, color: '#D9A441' },
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
      case 'pending': return 'bg-[#D9A441]/20 text-[#D9A441]';
      case 'processing': return 'bg-[#6FA8B0]/20 text-[#6FA8B0]';
      case 'completed': return 'bg-[#86B786]/20 text-[#86B786]';
      case 'duplicate': return 'bg-[#E3B04B]/20 text-[#E3B04B]';
      case 'failed': return 'bg-[#C9705C]/20 text-[#C9705C]';
    }
  };

  return (
    <div className="w-full bg-[#0D181B] rounded-md p-8 border border-[rgba(232,228,215,0.10)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#E8E4D7] mb-2 flex items-center gap-3">
              <Key className="w-8 h-8 text-[#E3B04B]" />
              Idempotency Keys
            </h2>
            <p className="text-[#A8B8B4]">Safe request deduplication for distributed systems</p>
          </div>
          <button
            onClick={triggerRetrySimulation}
            disabled={showRetrySimulation || storedKeys.length === 0}
            className="px-4 py-2 bg-[#E3B04B] hover:bg-[#EDC06A] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B1517] font-medium rounded-md transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${showRetrySimulation ? 'animate-spin' : ''}`} />
            {showRetrySimulation ? 'Simulating...' : 'Simulate Retry'}
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-[#132124] rounded-md p-4 border border-[rgba(232,228,215,0.10)] mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#E3B04B]/20 rounded-md">
              <Shield className="w-5 h-5 text-[#E3B04B]" />
            </div>
            <div>
              <h4 className="text-[#E8E4D7] font-semibold mb-1">How Idempotency Works</h4>
              <p className="text-[#A8B8B4] text-sm">
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
            className="bg-[#132124] rounded-md p-4 border border-[rgba(232,228,215,0.10)]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A8B8B4] text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-[#E8E4D7]">{metrics.totalRequests.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-[#6FA8B0]" />
            </div>
          </motion.div>

          <motion.div
            className="bg-[#132124] rounded-md p-4 border border-[rgba(232,228,215,0.10)]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A8B8B4] text-sm">Duplicates Blocked</p>
                <p className="text-2xl font-bold text-[#E3B04B]">{metrics.duplicatesBlocked}</p>
              </div>
              <Shield className="w-8 h-8 text-[#E3B04B]" />
            </div>
          </motion.div>

          <motion.div
            className="bg-[#132124] rounded-md p-4 border border-[rgba(232,228,215,0.10)]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A8B8B4] text-sm">Keys Stored</p>
                <p className="text-2xl font-bold text-[#E8E4D7]">{metrics.keysStored}</p>
              </div>
              <Key className="w-8 h-8 text-[#86B786]" />
            </div>
          </motion.div>

          <motion.div
            className="bg-[#132124] rounded-md p-4 border border-[rgba(232,228,215,0.10)]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A8B8B4] text-sm">Avg Response</p>
                <p className="text-2xl font-bold text-[#E8E4D7]">{metrics.avgResponseTime.toFixed(0)}ms</p>
              </div>
              <Zap className="w-8 h-8 text-[#D9A441]" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Request Flow */}
        <div>
          <h3 className="text-lg font-semibold text-[#E8E4D7] mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#86B786] animate-pulse" />
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
                  className="bg-[#132124] rounded-md p-4 border border-[rgba(232,228,215,0.10)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-[#6FA8B0]/20 text-[#6FA8B0] rounded font-mono">
                        {req.method}
                      </span>
                      <span className="text-[#E8E4D7] text-sm font-medium">{req.endpoint}</span>
                      {req.isRetry && (
                        <span className="text-xs px-2 py-1 bg-[#D9A441]/20 text-[#D9A441] rounded flex items-center gap-1">
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
                    <Key className="w-3 h-3 text-[#8CA3A0]" />
                    <span className="text-[#A8B8B4] font-mono">{req.idempotencyKey}</span>
                    {req.amount && (
                      <span className="ml-auto text-[#8CA3A0]">${req.amount}</span>
                    )}
                  </div>
                  {req.status === 'duplicate' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 text-xs text-[#E3B04B] bg-[#E3B04B]/10 rounded p-2 flex items-center gap-2"
                    >
                      <Shield className="w-3 h-3" />
                      Duplicate detected! Returning cached response.
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {requests.length === 0 && (
              <div className="text-center text-[#8CA3A0] py-8">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Waiting for requests...
              </div>
            )}
          </div>
        </div>

        {/* Key Store */}
        <div>
          <h3 className="text-lg font-semibold text-[#E8E4D7] mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#E3B04B]" />
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
                    className={`bg-[#132124] rounded-md p-4 border transition-colors ${
                      key.status === 'completed' ? 'border-[#86B786]/50' :
                      key.status === 'failed' ? 'border-[#C9705C]/50' :
                      'border-[#D9A441]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#E8E4D7] font-mono text-sm">{key.key}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        key.status === 'completed' ? 'bg-[#86B786]/20 text-[#86B786]' :
                        key.status === 'failed' ? 'bg-[#C9705C]/20 text-[#C9705C]' :
                        'bg-[#D9A441]/20 text-[#D9A441]'
                      }`}>
                        {key.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#A8B8B4]">
                      <span>Created: {new Date(key.createdAt).toLocaleTimeString()}</span>
                      <span className={`flex items-center gap-1 ${isExpiringSoon ? 'text-[#D9A441]' : ''}`}>
                        {isExpiringSoon && <AlertTriangle className="w-3 h-3" />}
                        TTL: 24h
                      </span>
                    </div>
                    {key.response && (
                      <div className="mt-2 text-xs bg-[#0B1517] rounded p-2">
                        <span className="text-[#8CA3A0]">Cached Response:</span>
                        <span className="text-[#A8B8B4] ml-2">{key.response}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {storedKeys.length === 0 && (
              <div className="text-center text-[#8CA3A0] py-8">
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
            className="bg-[#E3B04B]/10 border border-[#E3B04B]/50 rounded-md p-4 mb-6 flex items-center gap-3"
          >
            <Shield className="w-6 h-6 text-[#E3B04B]" />
            <div>
              <p className="text-[#E3B04B] font-medium">Retry Simulation Active</p>
              <p className="text-[#E3B04B]/70 text-sm">
                Watch how duplicate requests with the same idempotency key are handled safely
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Footer */}
      <div className="mt-6 text-center text-sm text-[#A8B8B4]">
        <p>Demonstrating idempotency key-based request deduplication for safe API retries</p>
      </div>
    </div>
  );
}
