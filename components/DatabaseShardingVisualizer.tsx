'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Server, Zap, TrendingUp, BarChart3, RefreshCw, MapPin, Hash, SortAsc } from 'lucide-react';

interface Shard {
  id: number;
  name: string;
  dataSize: number;
  queryLoad: number;
  color: string;
  region?: string;
  rangeStart?: number;
  rangeEnd?: number;
}

interface Query {
  id: string;
  userId: number;
  type: 'read' | 'write';
  shardId: number;
  timestamp: number;
  status: 'routing' | 'executing' | 'complete';
}

type ShardingStrategy = 'hash' | 'range' | 'geo';

const REGIONS = [
  { name: 'US-East', color: '#6FA8B0', lat: 40, lon: -74 },
  { name: 'US-West', color: '#86B786', lat: 37, lon: -122 },
  { name: 'EU', color: '#D9A441', lat: 51, lon: 0 },
  { name: 'Asia', color: '#B08FC9', lat: 35, lon: 139 },
];

export default function DatabaseShardingVisualizer() {
  const [strategy, setStrategy] = useState<ShardingStrategy>('hash');
  const [shards, setShards] = useState<Shard[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [metrics, setMetrics] = useState({
    totalQueries: 0,
    queriesPerSec: 0,
    totalData: 0,
    avgLatency: 12,
  });
  const queryIdCounter = useRef(0);

  // Initialize shards based on strategy
  useEffect(() => {
    let newShards: Shard[] = [];

    switch (strategy) {
      case 'hash':
        newShards = [
          { id: 0, name: 'Shard-0', dataSize: 2400, queryLoad: 0, color: '#6FA8B0' },
          { id: 1, name: 'Shard-1', dataSize: 2300, queryLoad: 0, color: '#86B786' },
          { id: 2, name: 'Shard-2', dataSize: 2500, queryLoad: 0, color: '#D9A441' },
          { id: 3, name: 'Shard-3', dataSize: 2200, queryLoad: 0, color: '#B08FC9' },
        ];
        break;
      case 'range':
        newShards = [
          { id: 0, name: 'Shard-A', dataSize: 1800, queryLoad: 0, color: '#6FA8B0', rangeStart: 0, rangeEnd: 2500 },
          { id: 1, name: 'Shard-B', dataSize: 2600, queryLoad: 0, color: '#86B786', rangeStart: 2500, rangeEnd: 5000 },
          { id: 2, name: 'Shard-C', dataSize: 2100, queryLoad: 0, color: '#D9A441', rangeStart: 5000, rangeEnd: 7500 },
          { id: 3, name: 'Shard-D', dataSize: 2900, queryLoad: 0, color: '#B08FC9', rangeStart: 7500, rangeEnd: 10000 },
        ];
        break;
      case 'geo':
        newShards = REGIONS.map((region, idx) => ({
          id: idx,
          name: `Shard-${region.name}`,
          dataSize: 2000 + Math.random() * 1000,
          queryLoad: 0,
          color: region.color,
          region: region.name,
        }));
        break;
    }

    setShards(newShards);
    setQueries([]);
  }, [strategy]);

  // Calculate shard for query based on strategy
  const getShardForQuery = (userId: number): number => {
    switch (strategy) {
      case 'hash':
        return userId % shards.length;
      case 'range':
        // Map userId (0-10000) to a shard based on ranges
        const normalizedId = (userId % 10000);
        for (let i = 0; i < shards.length; i++) {
          const shard = shards[i];
          if (shard.rangeStart !== undefined && shard.rangeEnd !== undefined) {
            if (normalizedId >= shard.rangeStart && normalizedId < shard.rangeEnd) {
              return i;
            }
          }
        }
        return 0;
      case 'geo':
        // Simulate geo-based routing (random for demo)
        return Math.floor(Math.random() * shards.length);
      default:
        return 0;
    }
  };

  // Generate queries
  useEffect(() => {
    if (shards.length === 0) return;

    const interval = setInterval(() => {
      const userId = Math.floor(Math.random() * 10000);
      const shardId = getShardForQuery(userId);

      const newQuery: Query = {
        id: `query-${queryIdCounter.current++}`,
        userId,
        type: Math.random() > 0.3 ? 'read' : 'write',
        shardId,
        timestamp: Date.now(),
        status: 'routing',
      };

      setQueries(prev => [...prev.slice(-30), newQuery]);
      setMetrics(prev => ({
        ...prev,
        totalQueries: prev.totalQueries + 1,
      }));
    }, 600);

    return () => clearInterval(interval);
  }, [shards, strategy]);

  // Update query lifecycle
  useEffect(() => {
    const interval = setInterval(() => {
      setQueries(prev =>
        prev.map(query => {
          if (query.status === 'routing') return { ...query, status: 'executing' as const };
          if (query.status === 'executing') return { ...query, status: 'complete' as const };
          return query;
        }).filter(query => query.status !== 'complete' || Date.now() - query.timestamp < 2000)
      );
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Update shard metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const recentQueries = queries.filter(q => Date.now() - q.timestamp < 1000);

      setMetrics(prev => ({
        ...prev,
        queriesPerSec: recentQueries.length,
        totalData: shards.reduce((acc, s) => acc + s.dataSize, 0),
        avgLatency: 8 + Math.random() * 10,
      }));

      // Update shard query loads
      setShards(prevShards =>
        prevShards.map(shard => ({
          ...shard,
          queryLoad: recentQueries.filter(q => q.shardId === shard.id).length,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [queries, shards.length]);

  // Trigger rebalancing
  const handleRebalance = () => {
    setIsRebalancing(true);

    // Simulate data redistribution
    setTimeout(() => {
      setShards(prevShards =>
        prevShards.map(shard => ({
          ...shard,
          dataSize: 2000 + Math.random() * 1000,
        }))
      );
      setIsRebalancing(false);
    }, 2000);
  };

  const getStrategyIcon = () => {
    switch (strategy) {
      case 'hash': return <Hash className="w-5 h-5" />;
      case 'range': return <SortAsc className="w-5 h-5" />;
      case 'geo': return <MapPin className="w-5 h-5" />;
    }
  };

  const getStrategyDescription = () => {
    switch (strategy) {
      case 'hash':
        return 'Data distributed using hash(user_id) % num_shards. Ensures even distribution.';
      case 'range':
        return 'Data partitioned by user_id ranges. Efficient for range queries.';
      case 'geo':
        return 'Data located near users geographically. Minimizes latency.';
    }
  };

  return (
    <div className="w-full bg-[#0D181B] rounded-md p-8 border border-[rgba(232,228,215,0.10)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#E8E4D7] mb-2 flex items-center gap-3">
              <Database className="w-8 h-8 text-[#6FA8B0]" />
              Database Sharding
            </h2>
            <p className="text-[#A8B8B4]">Horizontal partitioning for scalability</p>
          </div>
          <button
            onClick={handleRebalance}
            disabled={isRebalancing}
            className="px-4 py-2 bg-[#E3B04B] hover:bg-[#EDC06A] disabled:bg-[#E3B04B]/40 disabled:cursor-not-allowed text-[#0B1517] font-medium rounded-md transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRebalancing ? 'animate-spin' : ''}`} />
            {isRebalancing ? 'Rebalancing...' : 'Trigger Rebalance'}
          </button>
        </div>

        {/* Strategy Selector */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setStrategy('hash')}
            className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
              strategy === 'hash'
                ? 'bg-[#6FA8B0] text-[#0B1517]'
                : 'bg-[#132124] text-[#A8B8B4] border border-[rgba(232,228,215,0.10)] hover:text-[#E8E4D7]'
            }`}
          >
            <Hash className="w-4 h-4" />
            Hash-Based
          </button>
          <button
            onClick={() => setStrategy('range')}
            className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
              strategy === 'range'
                ? 'bg-[#86B786] text-[#0B1517]'
                : 'bg-[#132124] text-[#A8B8B4] border border-[rgba(232,228,215,0.10)] hover:text-[#E8E4D7]'
            }`}
          >
            <SortAsc className="w-4 h-4" />
            Range-Based
          </button>
          <button
            onClick={() => setStrategy('geo')}
            className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
              strategy === 'geo'
                ? 'bg-[#E3B04B] text-[#0B1517]'
                : 'bg-[#132124] text-[#A8B8B4] border border-[rgba(232,228,215,0.10)] hover:text-[#E8E4D7]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Geo-Based
          </button>
        </div>

        {/* Strategy Description */}
        <div className="bg-[#132124] rounded-md p-4 border border-[rgba(232,228,215,0.10)] mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#0B1517] rounded-md text-[#E8E4D7]">
              {getStrategyIcon()}
            </div>
            <div>
              <h4 className="text-[#E8E4D7] font-semibold mb-1">
                {strategy.charAt(0).toUpperCase() + strategy.slice(1)} Sharding Strategy
              </h4>
              <p className="text-[#A8B8B4] text-sm">{getStrategyDescription()}</p>
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
                <p className="text-[#A8B8B4] text-sm">Total Queries</p>
                <p className="text-2xl font-bold text-[#E8E4D7]">{metrics.totalQueries.toLocaleString()}</p>
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
                <p className="text-[#A8B8B4] text-sm">QPS</p>
                <p className="text-2xl font-bold text-[#E8E4D7]">{metrics.queriesPerSec}/s</p>
              </div>
              <Zap className="w-8 h-8 text-[#86B786]" />
            </div>
          </motion.div>

          <motion.div
            className="bg-[#132124] rounded-md p-4 border border-[rgba(232,228,215,0.10)]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A8B8B4] text-sm">Total Data</p>
                <p className="text-2xl font-bold text-[#E8E4D7]">{(metrics.totalData / 1000).toFixed(1)}GB</p>
              </div>
              <Database className="w-8 h-8 text-[#E3B04B]" />
            </div>
          </motion.div>

          <motion.div
            className="bg-[#132124] rounded-md p-4 border border-[rgba(232,228,215,0.10)]"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#A8B8B4] text-sm">Avg Latency</p>
                <p className="text-2xl font-bold text-[#E8E4D7]">{metrics.avgLatency.toFixed(1)}ms</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#D9A441]" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Shards Visualization */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#E8E4D7] mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-[#6FA8B0]" />
          Database Shards ({shards.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {shards.map((shard) => {
            const dataPercentage = (shard.dataSize / metrics.totalData) * 100;
            const isHeavy = shard.queryLoad > metrics.queriesPerSec / shards.length * 1.5;

            return (
              <motion.div
                key={shard.id}
                className={`bg-[#132124] rounded-md p-5 border-2 transition-all ${
                  isRebalancing ? 'border-[#E3B04B]' : 'border-[rgba(232,228,215,0.10)]'
                }`}
                animate={isRebalancing ? {
                  scale: [1, 1.02, 1],
                  borderColor: ['rgba(232,228,215,0.10)', '#E3B04B', 'rgba(232,228,215,0.10)'],
                } : {}}
                transition={{ duration: 0.5, repeat: isRebalancing ? Infinity : 0 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ backgroundColor: shard.color }}
                    />
                    <span className="text-[#E8E4D7] font-semibold">{shard.name}</span>
                  </div>
                  {isHeavy && (
                    <div className="px-2 py-1 bg-[#C9705C]/20 text-[#C9705C] text-xs rounded flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Hot
                    </div>
                  )}
                </div>

                {/* Shard Info */}
                <div className="space-y-3 mb-4">
                  {strategy === 'range' && shard.rangeStart !== undefined && (
                    <div className="text-xs text-[#A8B8B4]">
                      Range: {shard.rangeStart} - {shard.rangeEnd}
                    </div>
                  )}
                  {strategy === 'geo' && shard.region && (
                    <div className="text-xs text-[#A8B8B4] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {shard.region}
                    </div>
                  )}
                  <div className="text-xs text-[#A8B8B4]">
                    Data: {(shard.dataSize / 1000).toFixed(2)} GB ({dataPercentage.toFixed(1)}%)
                  </div>
                </div>

                {/* Data Size Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-[#A8B8B4] mb-1">
                    <span>Storage</span>
                    <span>{dataPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-[#0B1517] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: shard.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${dataPercentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Query Load */}
                <div>
                  <div className="flex items-center justify-between text-xs text-[#A8B8B4] mb-1">
                    <span>Query Load</span>
                    <span className={isHeavy ? 'text-[#C9705C] font-semibold' : ''}>
                      {shard.queryLoad} QPS
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full ${
                          idx < (shard.queryLoad / 2) ? 'bg-[#86B786]' : 'bg-[#0B1517]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Query Router Visualization */}
      <div className="bg-[#132124] rounded-md p-5 border border-[rgba(232,228,215,0.10)]">
        <h3 className="text-sm font-semibold text-[#E8E4D7] mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#86B786] animate-pulse" />
          Live Query Router
        </h3>

        {/* Query Stream */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {queries.slice(-12).reverse().map((query) => {
              const shard = shards[query.shardId];
              return (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 text-xs py-2 px-3 bg-[#0B1517] rounded-md border border-[rgba(232,228,215,0.10)]"
                >
                  <span className={`px-2 py-1 rounded font-mono ${
                    query.type === 'read' ? 'bg-[#6FA8B0]/20 text-[#6FA8B0]' : 'bg-[#D9A441]/20 text-[#D9A441]'
                  }`}>
                    {query.type.toUpperCase()}
                  </span>
                  <span className="text-[#A8B8B4]">user_id: {query.userId}</span>
                  <span className="text-[#8CA3A0]">→</span>
                  <span
                    className="px-2 py-1 rounded font-medium"
                    style={{
                      backgroundColor: `${shard?.color}20`,
                      color: shard?.color
                    }}
                  >
                    {shard?.name}
                  </span>
                  <span className={`ml-auto px-2 py-1 rounded text-xs ${
                    query.status === 'routing' ? 'bg-[#D9A441]/20 text-[#D9A441]' :
                    query.status === 'executing' ? 'bg-[#E3B04B]/20 text-[#E3B04B]' :
                    'bg-[#86B786]/20 text-[#86B786]'
                  }`}>
                    {query.status}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 text-center text-sm text-[#A8B8B4]">
        <p>Demonstrating {strategy}-based sharding across {shards.length} database shards for horizontal scalability</p>
      </div>
    </div>
  );
}
