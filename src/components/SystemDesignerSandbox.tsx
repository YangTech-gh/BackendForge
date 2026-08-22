import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  AlertTriangle, 
  Activity, 
  DollarSign, 
  FileText,
  Code2,
  RefreshCw
} from 'lucide-react';
import { invokeEdgeFunction } from '../lib/api';
import { SystemNode, SystemConnection } from '../types';

export const SystemDesignerSandbox: React.FC = () => {
  const [nodes, setNodes] = useState<SystemNode[]>([
    { id: '1', label: 'Ingress API Gateway (NGINX)', type: 'gateway', x: 50, y: 100, status: 'healthy', rps: 25000, latencyMs: 3, config: { pods: 4 } },
    { id: '2', label: 'Distributed Rate Limiter', type: 'rate_limiter', x: 250, y: 100, status: 'healthy', rps: 25000, latencyMs: 1.5, config: { algorithm: 'Sliding Window' } },
    { id: '3', label: 'Redis Cluster (Cache & Lock)', type: 'cache', x: 450, y: 50, status: 'healthy', rps: 18000, latencyMs: 0.8, config: { maxmemory: '16gb' } },
    { id: '4', label: 'PostgreSQL Primary DB', type: 'primary_db', x: 450, y: 180, status: 'bottleneck', rps: 7000, latencyMs: 24, config: { poolSize: 20 } },
    { id: '5', label: 'BullMQ Message Buffer', type: 'queue', x: 650, y: 100, status: 'healthy', rps: 12000, latencyMs: 4, config: { workers: 8 } },
    { id: '6', label: 'AI Agent Service (Forger 1.0)', type: 'ai_agent', x: 850, y: 100, status: 'healthy', rps: 500, latencyMs: 320, config: { vectorDb: 'pgvector' } }
  ]);

  const [connections] = useState<SystemConnection[]>([
    { id: 'c1', fromId: '1', toId: '2', protocol: 'HTTP/REST', active: true },
    { id: 'c2', fromId: '2', toId: '3', protocol: 'TCP/Pool', active: true },
    { id: 'c3', fromId: '2', toId: '4', protocol: 'TCP/Pool', active: true },
    { id: 'c4', fromId: '2', toId: '5', protocol: 'AMQP', active: true },
    { id: 'c5', fromId: '5', toId: '6', protocol: 'gRPC', active: true }
  ]);

  const [targetRps, setTargetRps] = useState<number>(35000);
  const [latencyBudget, setLatencyBudget] = useState<number>(50);
  const [systemGoal, setSystemGoal] = useState<string>('Multi-Tenant Idempotent SaaS Webhook Engine');

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  // Trigger AI Architecture Evaluation
  const handleEvaluateArchitecture = async () => {
    setIsEvaluating(true);
    try {
      const data = await invokeEdgeFunction('ai-system-review', {
        body: {
          nodes,
          connections,
          targetRps,
          latencyBudgetMs: latencyBudget,
          systemGoal
        }
      });

      setEvaluationResult(data);
      setIsEvaluating(false);
    } catch (err: any) {
      console.error('System Review error:', err);
      setIsEvaluating(false);
      setEvaluationResult({
        score: 0,
        feedback: `Failed to connect to architecture review service: ${err.message || 'Unknown error'}. Please try again later.`,
        suggestions: []
      });
    }
  };

  // Preset Scenario Spikes
  const handleSimulateSpike = () => {
    setTargetRps(75000);
    setNodes(prev => prev.map(n => {
      if (n.type === 'primary_db') return { ...n, status: 'failed', rps: 30000 };
      if (n.type === 'rate_limiter') return { ...n, status: 'bottleneck' };
      return n;
    }));
  };

  const handleResetNodes = () => {
    setTargetRps(25000);
    setNodes(prev => prev.map(n => ({ ...n, status: 'healthy' })));
  };

  return (
    <div className="space-y-8 pb-16" role="main" aria-label="System Architecture Designer">
      
      {/* Header */}
      <header className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
            <span>INTERACTIVE SYSTEM DESIGNER & CHAOS ENGINE</span>
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            System Architecture & Concurrency Sandbox
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Design distributed backend topology, simulate peak traffic spikes, evaluate SPOFs, and generate formal technical RFCs using Forger 1.0.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleSimulateSpike}
            className="flex items-center space-x-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 px-4 py-2 rounded-xl text-xs font-mono font-bold transition shadow-md shadow-red-950/40"
          >
            <Activity className="w-3.5 h-3.5 text-red-400" />
            <span>Simulate 75k RPS Spike</span>
          </button>

          <button
            onClick={handleEvaluateArchitecture}
            disabled={isEvaluating}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition shadow-lg shadow-red-950/50 font-mono border border-red-500/30"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>{isEvaluating ? 'Evaluating Topology...' : 'Evaluate via Forger 1.0 API'}</span>
          </button>
        </div>
      </div>

      {/* Top Configuration Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 shadow-xl">
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400">Target System Load (RPS)</label>
          <input
            type="number"
            value={targetRps}
            onChange={(e) => setTargetRps(Number(e.target.value))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-indigo-400 font-mono font-bold focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400">Latency Budget (p99 ms)</label>
          <input
            type="number"
            value={latencyBudget}
            onChange={(e) => setLatencyBudget(Number(e.target.value))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400">System Goal / Workload Type</label>
          <input
            type="text"
            value={systemGoal}
            onChange={(e) => setSystemGoal(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Architecture Canvas Visualizer — SVG Topology */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        {/* Canvas Grid Lines */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-zinc-200 uppercase">
              Distributed Component Topology ({nodes.length} Nodes)
            </span>
          </div>

          <button
            onClick={handleResetNodes}
            className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Health</span>
          </button>
        </div>

        {/* SVG Topology Canvas */}
        <div className="relative z-10 w-full overflow-x-auto">
          <svg
            viewBox="0 0 980 280"
            className="w-full min-w-[700px] h-auto"
            role="img"
            aria-label="System architecture topology diagram"
          >
            {/* Connection Lines */}
            {connections.map((conn) => {
              const fromNode = nodes.find(n => n.id === conn.fromId);
              const toNode = nodes.find(n => n.id === conn.toId);
              if (!fromNode || !toNode) return null;

              const fromCx = fromNode.x + 75;
              const fromCy = fromNode.y + 55;
              const toCx = toNode.x + 75;
              const toCy = toNode.y + 55;

              const strokeColor = conn.active ? '#6366f1' : '#52525b';
              const midX = (fromCx + toCx) / 2;
              const midY = (fromCy + toCy) / 2 - 20;

              return (
                <g key={conn.id}>
                  <path
                    d={`M ${fromCx} ${fromCy} Q ${midX} ${midY} ${toCx} ${toCy}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2"
                    strokeDasharray={conn.active ? 'none' : '6 4'}
                    opacity="0.6"
                  />
                  {/* Protocol label */}
                  <text
                    x={midX}
                    y={midY + 14}
                    textAnchor="middle"
                    className="fill-zinc-500 text-[9px] font-mono"
                  >
                    {conn.protocol}
                  </text>
                  {/* Arrowhead */}
                  <circle cx={toCx} cy={toCy} r="3" fill={strokeColor} opacity="0.7" />
                </g>
              );
            })}

            {/* Node Boxes */}
            {nodes.map((node) => {
              const isFailed = node.status === 'failed';
              const isBottleneck = node.status === 'bottleneck';
              const fillColor = isFailed ? '#4c1d2f' : isBottleneck ? '#422006' : '#18181b';
              const strokeColor = isFailed ? '#f43f5e' : isBottleneck ? '#f59e0b' : '#27272a';
              const textColor = isFailed ? '#fda4af' : isBottleneck ? '#fcd34d' : '#e4e4e7';
              const statusColor = isFailed ? '#f43f5e' : isBottleneck ? '#f59e0b' : '#10b981';
              const statusBg = isFailed ? '#4c1d2f' : isBottleneck ? '#422006' : '#052e16';

              return (
                <g key={node.id}>
                  {/* Node background */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width="150"
                    height="110"
                    rx="16"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="1.5"
                  />
                  {/* Type badge */}
                  <rect x={node.x + 8} y={node.y + 8} width="70" height="18" rx="9" fill="#09090b" stroke="#27272a" strokeWidth="1" />
                  <text x={node.x + 43} y={node.y + 20} textAnchor="middle" className="fill-zinc-500 text-[8px] font-mono uppercase">
                    {node.type}
                  </text>
                  {/* Status badge */}
                  <rect x={node.x + 100} y={node.y + 8} width="42" height="18" rx="9" fill={statusBg} stroke={statusColor} strokeWidth="1" />
                  <circle cx={node.x + 110} cy={node.y + 17} r="3" fill={statusColor}>
                    {node.status !== 'healthy' && <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />}
                  </circle>
                  <text x={node.x + 127} y={node.y + 20} textAnchor="middle" fill={statusColor} className="text-[7px] font-mono font-bold">
                    {node.status.toUpperCase()}
                  </text>
                  {/* Label */}
                  <text x={node.x + 12} y={node.y + 48} className="text-[11px] font-bold" fill={textColor}>
                    {node.label.length > 22 ? node.label.slice(0, 22) + '...' : node.label}
                  </text>
                  {/* Stats */}
                  <text x={node.x + 12} y={node.y + 68} className="text-[8px] font-mono" fill="#71717a">
                    RPS: <tspan fill="#d4d4d8" fontWeight="bold">{node.rps.toLocaleString()}</tspan>
                  </text>
                  <text x={node.x + 12} y={node.y + 82} className="text-[8px] font-mono" fill="#71717a">
                    LATENCY: <tspan fill="#d4d4d8" fontWeight="bold">{node.latencyMs} ms</tspan>
                  </text>
                  {/* Glow for failed/bottleneck */}
                  {(isFailed || isBottleneck) && (
                    <rect
                      x={node.x - 2}
                      y={node.y - 2}
                      width="154"
                      height="114"
                      rx="18"
                      fill="none"
                      stroke={statusColor}
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* AI RFC & Architecture Evaluation Output */}
      {evaluationResult && (
        <div className="bg-zinc-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
          
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white font-mono">
                {evaluationResult.rfcTitle || 'Architecture RFC Evaluation'}
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
              Evaluated via Forger 1.0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: SPOFs & CAP Theorem */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-rose-400 font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Single Points of Failure (SPOFs)</span>
                </h3>
                <ul className="space-y-2">
                  {evaluationResult.spofs?.map((spof: string, idx: number) => (
                    <li key={idx} className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-2xl border border-rose-500/20 leading-relaxed">
                      • {spof}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-indigo-400 font-bold">
                  CAP Theorem Trade-Off
                </h3>
                <p className="text-xs text-zinc-300 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 leading-relaxed">
                  {evaluationResult.capTradeoffs}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Estimated Infrastructure Cost</span>
                </h3>
                <div className="text-sm font-bold text-white font-mono bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
                  {evaluationResult.estimatedMonthlyCost}
                </div>
              </div>
            </div>

            {/* Right: Concurrency Analysis & Code Snippet */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-teal-400 font-bold">
                  Concurrency & Pool Exhaustion Analysis
                </h3>
                <p className="text-xs text-zinc-300 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 leading-relaxed">
                  {evaluationResult.concurrencyAnalysis}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold flex items-center space-x-1">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>Generated Architectural Pattern Code</span>
                </h3>
                <pre className="bg-zinc-950 text-zinc-200 p-4 rounded-2xl border border-zinc-800 font-mono text-xs overflow-x-auto leading-relaxed max-h-56">
                  {evaluationResult.generatedCodeSnippet}
                </pre>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
