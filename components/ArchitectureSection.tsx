'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Cloud, Server, Database, ArrowRight, ShieldCheck, Zap, Layers, Lock } from 'lucide-react';

// --- TYPES ---
interface NodeProps {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string; // Tailwind color class for border/text (e.g., "green-500")
    x: number;
    y: number;
}

// --- COMPONENTS ---

const WorkflowNode: React.FC<NodeProps> = ({ id, title, subtitle, icon, color, x, y }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute p-0"
            style={{ left: x, top: y, width: 280 }}
        >
            {/* Label Tag */}
            <div className="mb-2">
                <span className="bg-[#1A1A1A] border border-white/10 text-gray-400 text-[10px] px-2 py-1 rounded-md font-mono">
                    node_id: {id}
                </span>
            </div>

            {/* Card */}
            <div className={`relative bg-[#0A0A0A] rounded-xl border border-white/10 overflow-hidden group hover:border-${color}/50 transition-colors duration-300`}>
                {/* Colored Top Border */}
                <div className={`h-1 w-full bg-${color}`} />

                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
                            {icon}
                        </div>
                        <div className="text-gray-600">...</div>
                    </div>

                    <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                    <p className="text-gray-500 text-xs font-mono">{subtitle}</p>
                </div>

                {/* Connection Points (Visual only) */}
                <div className="absolute left-0 top-1/2 -translate-x-1/2 w-3 h-3 bg-[#1A1A1A] border border-gray-600 rounded-full"></div>
                <div className="absolute right-0 top-1/2 translate-x-1/2 w-3 h-3 bg-[#1A1A1A] border border-gray-600 rounded-full"></div>
            </div>
        </motion.div>
    );
};

const ConnectionLine = ({ startX, startY, endX, endY, color = "#555" }: { startX: number, startY: number, endX: number, endY: number, color?: string }) => {
    // Calculate control points for a smooth Bezier curve
    const midX = (startX + endX) / 2;
    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
            {/* Background Line */}
            <path d={path} stroke="#333" strokeWidth="2" fill="none" />

            {/* Animated Dash Line */}
            <motion.path
                d={path}
                stroke={color}
                strokeWidth="2"
                fill="none"
                strokeDasharray="10 10"
                initial={{ strokeDashoffset: 20 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />

            {/* Moving Dot/Arrow */}
            <circle r="4" fill={color}>
                <animateMotion dur="2s" repeatCount="indefinite" path={path} />
            </circle>
        </svg>
    );
};

const ArchitectureSection = () => {
    return (
        <div className="w-full bg-[#050505] py-24 border-t border-white/5 relative overflow-hidden min-h-[800px]">
            {/* Header */}
            <div className="text-center mb-20 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-medium mb-4">
                    <Layers size={12} /> Workflow Architecture
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Automate <span className="text-orange-500">Privacy</span>
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Visualize the mixing logic like a pro. A node-based architecture for infinite composability and security.
                </p>
            </div>

            {/* Canvas Container */}
            <div className="relative w-full max-w-7xl mx-auto h-[600px] bg-[#080808] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                {/* Status Badge */}
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-[#151515] border border-white/10 px-3 py-1.5 rounded-lg z-20">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-gray-300 font-mono">System Active</span>
                </div>

                {/* --- NODES --- */}
                {/* 1. Event Trigger (Zcash Wallet) */}
                <WorkflowNode
                    id="zcash-wallet-v1"
                    title="Zcash Wallet"
                    subtitle="Shielded Transaction / User Intent"
                    icon={<Wallet size={24} />}
                    color="green-500"
                    x={50}
                    y={250}
                />

                {/* 2. Automation Cloud (Bridge Engine) */}
                <WorkflowNode
                    id="mixer-engine-core"
                    title="Mixer Engine"
                    subtitle="Orchestrate Swaps & Validation"
                    icon={<Cloud size={24} />}
                    color="blue-500"
                    x={400}
                    y={250}
                />

                {/* 3a. Bot Engine (SimpleSwap API) - Top Branch */}
                <WorkflowNode
                    id="simpleswap-api"
                    title="Exchange API"
                    subtitle="Liquidity & Rate Execution"
                    icon={<Server size={24} />}
                    color="orange-500"
                    x={750}
                    y={100}
                />

                {/* 3b. Marketplace (Solana RPC) - Bottom Branch */}
                <WorkflowNode
                    id="solana-rpc-node"
                    title="Solana RPC"
                    subtitle="Transaction Confirmation"
                    icon={<Database size={24} />}
                    color="purple-500"
                    x={750}
                    y={400}
                />

                {/* 4. Token Layer (Solana Wallet) */}
                <WorkflowNode
                    id="solana-wallet-final"
                    title="Solana Wallet"
                    subtitle="Receive SOL / SPL Tokens"
                    icon={<Zap size={24} />}
                    color="yellow-500"
                    x={1100}
                    y={250}
                />

                {/* --- CONNECTIONS --- */}
                {/* Zcash -> Bridge */}
                <ConnectionLine startX={330} startY={320} endX={400} endY={320} color="#22c55e" />

                {/* Bridge -> SimpleSwap (Top) */}
                <ConnectionLine startX={680} startY={320} endX={750} endY={170} color="#3b82f6" />

                {/* Bridge -> Solana RPC (Bottom) */}
                <ConnectionLine startX={680} startY={320} endX={750} endY={470} color="#3b82f6" />

                {/* SimpleSwap -> Solana Wallet */}
                <ConnectionLine startX={1030} startY={170} endX={1100} endY={320} color="#f97316" />

                {/* Solana RPC -> Solana Wallet */}
                <ConnectionLine startX={1030} startY={470} endX={1100} endY={320} color="#a855f7" />

            </div>
        </div>
    );
};

export default ArchitectureSection;
