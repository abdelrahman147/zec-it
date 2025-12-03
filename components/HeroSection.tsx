'use client';

import React from 'react';
import { MessageSquare, ArrowUpRight, Wallet, Activity, RefreshCw, ChevronRight } from 'lucide-react';
import { getExchangeQuote } from '@/app/actions/simpleswap';

interface HeroSectionProps {
    onLaunchApp: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onLaunchApp }) => {
    const [solAmount, setSolAmount] = React.useState<number | null>(null);
    const [usdRate, setUsdRate] = React.useState<number | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get accurate exchange rate from SimpleSwap for 1 ZEC
                const quote = await getExchangeQuote(1, 'zec', 'sol');
                setSolAmount(quote?.value ?? null);

                // 2. Get USD price for ZEC from CoinGecko for display
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=zcash&vs_currencies=usd');
                const data = await res.json();
                setUsdRate(data.zcash.usd);
            } catch (e) {
                console.error("Failed to fetch hero data", e);
            }
        };
        fetchData();
    }, []);

    const zecAmount = 1;
    const usdValue = usdRate ? zecAmount * usdRate : 0;

    return (
        <div className="relative w-full min-h-screen bg-[#080400] overflow-hidden flex flex-col pt-24">
            {/* --- IMPINETS/AMBIENT LIGHTING SETUP --- */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[300px] md:w-[500px] h-[80%] bg-gradient-to-b from-orange-400/40 via-orange-600/10 to-transparent blur-[60px] md:blur-[80px] pointer-events-none mix-blend-screen" />
            <div className="absolute top-[-10%] left-[-10%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-[radial-gradient(circle,rgba(249,115,22,0.25)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-[radial-gradient(circle,rgba(217,119,6,0.25)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:150px_150px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8 md:mt-20">
                <h1 className="text-4xl md:text-8xl font-medium text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
                    Safe and private Bridge <br />
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">Zcash to Solana</span>
                </h1>

                <p className="max-w-xl mx-auto text-base md:text-lg text-gray-400/80 mb-12 md:mb-20 font-light leading-relaxed px-4">
                    Safe and easy privacy bridging for everyone. <br className="hidden md:block" />
                    Move assets anonymously with Zecit.
                </p>

                {/* Bridge Interface Mockup */}
                <div className="relative mx-auto max-w-5xl px-2 md:px-0">
                    {/* The Floating Pill Button */}
                    <div className="absolute -top-6 md:-top-7 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center">
                        <button
                            onClick={onLaunchApp}
                            className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium shadow-[0_10px_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_10px_50px_-5px_rgba(249,115,22,0.6)] hover:-translate-y-1 transition-all text-sm md:text-base"
                        >
                            <MessageSquare size={18} className="fill-white" />
                            Start bridging now <ArrowUpRight size={18} />
                        </button>
                    </div>

                    {/* Dashboard Container (Visual Only in Hero) */}
                    <div className="relative bg-[#0d0d0d] rounded-[24px] md:rounded-[32px] border border-white/10 shadow-2xl overflow-hidden p-2 md:p-4 pointer-events-none select-none mt-6 md:mt-0">
                        <div className="bg-[#141414] rounded-[16px] md:rounded-[24px] overflow-hidden min-h-[400px] md:min-h-[500px] flex flex-col md:flex-row relative">
                            <div className="hidden md:flex flex-col w-64 p-6 border-r border-white/5 bg-[#141414]">
                                <div className="space-y-6 mt-8">
                                    <div className="flex items-center gap-3 text-orange-500 bg-orange-500/10 px-4 py-3 rounded-xl font-medium"><Wallet size={20} /> Bridge</div>
                                </div>
                            </div>
                            <div className="flex-1 p-4 md:p-12 relative">
                                <div className="relative z-10 flex flex-col gap-4 md:gap-6 max-w-2xl mx-auto mt-8 md:mt-8">
                                    <div className="flex items-center justify-between mb-2 md:mb-4">
                                        <h3 className="text-xl md:text-2xl font-bold text-white">Bridge Assets</h3>
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-xs text-gray-400">Network Stable</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 flex justify-between items-center">
                                        <div>
                                            <span className="text-[10px] md:text-xs text-gray-500 font-mono mb-1 md:mb-2 block">FROM (ZCASH SHIELDED)</span>
                                            <div className="text-2xl md:text-4xl font-bold text-white font-mono">{zecAmount.toFixed(2)}</div>
                                            <span className="text-[10px] md:text-xs text-green-500 mt-1 block">
                                                {usdRate ? `≈ $${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Loading...'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2 bg-black px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-white/10">
                                                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-orange-500 flex items-center justify-center text-[8px] md:text-[10px] text-black font-bold">Z</div>
                                                <span className="font-bold text-xs md:text-sm text-white">ZEC</span>
                                                <ChevronRight size={12} className="text-gray-500" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center -my-3 z-10">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-[#252525] rounded-full border border-white/10 flex items-center justify-center text-gray-400">
                                            <ArrowUpRight size={14} />
                                        </div>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 flex justify-between items-center">
                                        <div>
                                            <span className="text-[10px] md:text-xs text-gray-500 font-mono mb-1 md:mb-2 block">TO (SOLANA SPL)</span>
                                            <div className="text-2xl md:text-4xl font-bold text-white font-mono">
                                                {solAmount ? solAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '...'}
                                            </div>
                                            <span className="text-[10px] md:text-xs text-gray-500 mt-1 block">Fees: 0.01 SOL</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2 bg-black px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-white/10">
                                                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400 flex items-center justify-center text-[8px] md:text-[10px] text-white font-bold">S</div>
                                                <span className="font-bold text-xs md:text-sm text-white">SOL</span>
                                                <ChevronRight size={12} className="text-gray-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:block w-72 bg-[#1a1a1a] p-6 border-l border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-orange-500/5 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
