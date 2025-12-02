'use client';

import React from 'react';
import { Layers, Shield, Zap } from 'lucide-react';

interface ArchNodeProps {
    label: string;
    sub: string;
    icon?: React.ReactElement;
    isCore?: boolean;
    isRoot?: boolean;
}

const ArchNode: React.FC<ArchNodeProps> = ({ label, sub, icon, isCore, isRoot }) => {
    return (
        <div className={`relative z-10 px-6 py-4 rounded-xl border shadow-xl min-w-[180px] text-center backdrop-blur-md group transition-all duration-300 hover:scale-105 ${isCore
            ? 'bg-[#151515] border-orange-500/50 shadow-orange-500/10'
            : 'bg-[#0a0a0a] border-white/10 hover:border-white/30'
            }`}>
            {icon && (
                <div className={`mx-auto mb-2 ${isCore ? 'text-orange-500' : 'text-gray-400 group-hover:text-white'}`}>
                    {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 24 })}
                </div>
            )}
            <div className={`font-bold text-sm tracking-wide ${isCore ? 'text-white' : 'text-gray-200'}`}>{label}</div>
            {sub && <div className="text-gray-500 text-[10px] font-mono mt-1">{sub}</div>}

            {/* Connection Dots */}
            {!isCore && (
                <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-600 ${isRoot ? '-right-1' : '-left-1'}`}></div>
            )}
        </div>
    );
};

// SVG Bracket to connect multiple nodes to a single parent
const BracketConnector = ({ type }: { type: 'left' | 'right' }) => {
    // type = 'left' (many on left connecting to 1 on right) or 'right' (1 on left connecting to many on right)
    const isLeft = type === 'left';

    return (
        <div className={`w-12 h-[200px] flex items-center justify-center relative opacity-50`}>
            <svg width="100%" height="100%" viewBox="0 0 48 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                {/* Drawing a brace/bracket shape manually with SVG paths.
                   Top curve, Bottom curve, Center point.
                */}
                {isLeft ? (
                    // Combines 3 points on left to 1 point on right
                    <path d="M0 10 C 20 10, 24 100, 48 100 M0 100 L 48 100 M0 190 C 20 190, 24 100, 48 100" stroke="#555" strokeWidth="1.5" fill="none" />
                ) : (
                    // Combines 1 point on left to 3 points on right
                    <path d="M48 10 C 28 10, 24 100, 0 100 M48 100 L 0 100 M48 190 C 28 190, 24 100, 0 100" stroke="#555" strokeWidth="1.5" fill="none" />
                )}
            </svg>
        </div>
    )
}

const ArchitectureSection = () => {
    return (
        <div className="w-full bg-[#050505] py-24 border-t border-white/5 overflow-x-auto overflow-y-hidden relative">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            <div className="absolute top-8 left-8 z-10 pointer-events-none">
                <div className="flex items-center gap-2 mb-2">
                    <Layers className="text-orange-500" size={24} />
                    <h2 className="text-2xl font-bold text-white">System Architecture</h2>
                </div>
                <p className="text-gray-500 text-sm max-w-md">Interactive view of the Zecit privacy-preserving bridge flow.</p>
                <p className="md:hidden text-orange-500 text-xs mt-2 animate-pulse">← Scroll to explore →</p>
            </div>

            <div className="min-w-[1200px] flex justify-center items-center gap-4 relative py-20 px-20">

                {/* Main Connector Line (Background) */}
                <div className="absolute top-1/2 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-gray-800 via-orange-900/50 to-purple-900/50 -translate-y-1/2 -z-10"></div>

                {/* LEFT CLUSTER: Zcash Features -> Zcash Protocol */}
                <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-6">
                        <ArchNode label="Shielded Pool" sub="Orchard / Sapling" />
                        <ArchNode label="zk-SNARKs" sub="Halo 2 Proofs" />
                        <ArchNode label="Unified Addr" sub="Receiver Privacy" />
                    </div>

                    <BracketConnector type="left" />

                    <div className="ml-4">
                        <ArchNode label="Zcash Protocol" sub="Source Chain" icon={<Shield />} isRoot />
                    </div>
                </div>

                {/* ARROW CONNECTOR */}
                <div className="w-16 h-[2px] bg-gray-700 relative">
                    <div className="absolute -right-1 -top-1 w-2 h-2 border-t-2 border-r-2 border-gray-700 rotate-45"></div>
                </div>

                {/* CENTER: CORE ENGINE */}
                <div className="mx-8 relative">
                    <div className="absolute -inset-4 bg-orange-500/5 rounded-full blur-xl animate-pulse-slow"></div>
                    <ArchNode label="Zecit Bridge Engine" sub="Settlement Layer" icon={<Layers />} isCore />
                </div>

                {/* ARROW CONNECTOR */}
                <div className="w-16 h-[2px] bg-gray-700 relative">
                    <div className="absolute -right-1 -top-1 w-2 h-2 border-t-2 border-r-2 border-gray-700 rotate-45"></div>
                </div>

                {/* RIGHT CLUSTER: Solana Protocol -> Solana Features */}
                <div className="flex items-center gap-2">
                    <div className="mr-4">
                        <ArchNode label="Solana Network" sub="Destination Chain" icon={<Zap />} isRoot />
                    </div>

                    <BracketConnector type="right" />

                    <div className="flex flex-col gap-6">
                        <ArchNode label="SPL Minting" sub="Token Extensions" />
                        <ArchNode label="High Throughput" sub="65,000 TPS" />
                        <ArchNode label="Turbine" sub="Block Propagation" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ArchitectureSection;
