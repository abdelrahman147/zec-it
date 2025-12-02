'use client';

import React, { useState } from 'react';
import { ChevronRight, Shield, ArrowRightLeft, ChevronDown, Lock, CheckCircle2, Check, TrendingUp, BarChart3 } from 'lucide-react';

const FeaturesSection = () => {
    const [activeSlide, setActiveSlide] = useState('Bridge');
    const slides = [
        { id: 'Bridge', label: 'Bridge', desc: 'Shielded Zcash to Solana' },
        { id: 'Swap', label: 'Swap', desc: 'Trade on Solana DEX' },
        { id: 'Secure', label: 'Secure', desc: 'Privacy & Audits' },
        { id: 'Live', label: 'Live', desc: 'Real-time Prices' },
    ];
    return (
        <div className="w-full py-24 bg-[#050505] text-white overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Left Sidebar Menu */}
                    <div className="w-full lg:w-64 space-y-8 shrink-0">
                        <div>
                            <h3 className="text-2xl font-semibold mb-6 text-white border-b border-white/10 pb-4 w-fit pr-12">Features</h3>
                            <div className="flex flex-col gap-2">
                                {slides.map(slide => (
                                    <div
                                        key={slide.id}
                                        onClick={() => setActiveSlide(slide.id)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${activeSlide === slide.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        <div>
                                            <div className="font-medium text-lg">{slide.label}</div>
                                            <div className="text-xs opacity-60">{slide.desc}</div>
                                        </div>
                                        {activeSlide === slide.id && <ChevronRight size={16} className="text-green-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Dashboard Interface - Dynamic Content */}
                    <div className="flex-1 bg-[#101012] rounded-2xl border border-white/10 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">

                        {/* Dashboard Header */}
                        <div className="h-14 border-b border-white/5 bg-[#141416] flex items-center justify-between px-6">
                            <div className="flex items-center gap-2">
                                <Shield size={18} className="text-green-500" />
                                <span className="font-bold tracking-tight text-white">ZECIT <span className="text-gray-600">APP</span></span>
                            </div>
                            <div className="flex items-center gap-2 bg-[#1a1a1d] px-3 py-1 rounded-full text-xs border border-white/5 text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                System Online
                            </div>
                        </div>

                        {/* Dashboard Body - Switched based on activeSlide */}
                        <div className="p-8 flex-1 flex flex-col">

                            {activeSlide === 'Bridge' && (
                                <div className="max-w-lg mx-auto w-full my-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-center mb-4">
                                        <h3 className="text-2xl font-bold">Privacy Bridge</h3>
                                        <p className="text-gray-500">Move Zcash to Solana Anonymously</p>
                                    </div>

                                    <div className="bg-[#18181a] p-4 rounded-2xl border border-white/5 space-y-4">
                                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">From (Shielded)</div>
                                                <div className="text-2xl font-mono">150.00</div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-[#222] px-3 py-1.5 rounded-lg border border-white/10">
                                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-xs">Z</div>
                                                <span className="text-sm font-bold">ZEC</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-center text-gray-500"><ArrowRightLeft className="rotate-90" /></div>

                                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">To (Solana)</div>
                                                <div className="text-2xl font-mono">2,450.00</div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-[#222] px-3 py-1.5 rounded-lg border border-white/10">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs">S</div>
                                                <span className="text-sm font-bold">SOL</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl font-bold text-white shadow-lg shadow-orange-500/20">
                                        Initiate Bridge
                                    </button>
                                </div>
                            )}

                            {activeSlide === 'Swap' && (
                                <div className="max-w-lg mx-auto w-full my-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-center mb-4">
                                        <h3 className="text-2xl font-bold">Solana Swap</h3>
                                        <p className="text-gray-500">Trade your bridged SOL instantly</p>
                                    </div>

                                    <div className="bg-[#18181a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none"></div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm text-gray-400">
                                                <span>Sell</span>
                                                <span>Balance: 2,450 SOL</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <input type="text" defaultValue="100" className="bg-transparent text-3xl font-bold w-full outline-none" />
                                                <button className="flex items-center gap-2 bg-[#222] px-4 py-2 rounded-xl border border-white/10">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400"></div>
                                                    <span>SOL</span>
                                                    <ChevronDown size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="my-6 border-t border-white/5 relative">
                                            <div className="absolute left-1/2 -top-3 -translate-x-1/2 bg-[#18181a] p-1.5 rounded-lg border border-white/10 text-gray-400">
                                                <ArrowRightLeft size={14} className="rotate-90" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm text-gray-400">
                                                <span>Buy</span>
                                                <span>Balance: 0.00 USDC</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <input type="text" defaultValue="2,340.50" className="bg-transparent text-3xl font-bold w-full outline-none text-green-400" />
                                                <button className="flex items-center gap-2 bg-[#222] px-4 py-2 rounded-xl border border-white/10">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                                                    <span>USDC</span>
                                                    <ChevronDown size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white shadow-lg shadow-purple-500/20">
                                        Swap Tokens
                                    </button>
                                </div>
                            )}

                            {activeSlide === 'Secure' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-[#18181a] p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center text-green-500 border border-green-500/30">
                                            <Lock size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold">Zero-Knowledge Proofs</h3>
                                        <p className="text-sm text-gray-400">Transactions are verified using zk-SNARKs, ensuring complete anonymity of sender and receiver.</p>
                                    </div>

                                    <div className="bg-[#18181a] p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-500 border border-blue-500/30">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold">Audited Contracts</h3>
                                        <p className="text-sm text-gray-400">Our bridge smart contracts have been fully audited by CertiK and Halborn.</p>
                                    </div>

                                    <div className="md:col-span-2 bg-[#18181a] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-gray-500">Compliance</div>
                                            <div className="text-lg font-bold text-white">Non-Custodial Design</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-lg border border-green-500/20 flex items-center gap-1"><Check size={12} /> Verified</span>
                                            <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-bold rounded-lg border border-purple-500/20 flex items-center gap-1"><Check size={12} /> Open Source</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSlide === 'Live' && (
                                <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#18181a] p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-xs">Z</div>
                                                <span className="font-bold">ZEC / USD</span>
                                            </div>
                                            <div className="text-2xl font-mono font-bold">$29.42</div>
                                            <div className="text-xs text-red-400">-1.2% (24h)</div>
                                        </div>
                                        <div className="bg-[#18181a] p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400"></div>
                                                <span className="font-bold">SOL / USD</span>
                                            </div>
                                            <div className="text-2xl font-mono font-bold">$142.85</div>
                                            <div className="text-xs text-green-400">+3.4% (24h)</div>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-[#18181a] rounded-xl border border-white/5 p-4 flex flex-col">
                                        <div className="text-sm font-medium text-gray-400 mb-4">Live Price Chart (SOL)</div>
                                        <div className="flex-1 relative w-full h-full">
                                            {/* Simple SVG Line Chart */}
                                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                                                <path d="M0 40 L10 38 L20 42 L30 30 L40 35 L50 20 L60 25 L70 15 L80 18 L90 5 L100 10" fill="none" stroke="#a855f7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                                                <path d="M0 40 L10 38 L20 42 L30 30 L40 35 L50 20 L60 25 L70 15 L80 18 L90 5 L100 10 L100 50 L0 50 Z" fill="url(#chart-gradient)" opacity="0.2" />
                                                <defs>
                                                    <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                                                        <stop offset="0%" stopColor="#a855f7" />
                                                        <stop offset="100%" stopColor="transparent" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FeaturesSection;
