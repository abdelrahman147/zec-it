'use client';

import React, { useState } from 'react';
import { ChevronRight, Shield, ArrowRightLeft, ChevronDown, Lock, CheckCircle2, Check, TrendingUp, BarChart3 } from 'lucide-react';

const FeaturesSection = () => {
    const [activeSlide, setActiveSlide] = useState('Secure');
    const [prices, setPrices] = useState<{
        zcash: { usd: number; usd_24h_change: number };
        solana: { usd: number; usd_24h_change: number };
    } | null>(null);
    const [chartData, setChartData] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const slides = [
        { id: 'Secure', label: 'Secure', desc: 'Privacy & Audits' },
        { id: 'Live', label: 'Live', desc: 'Real-time Prices' },
    ];

    // Fetch Prices & Chart Data
    React.useEffect(() => {
        if (activeSlide === 'Live') {
            const fetchData = async () => {
                setLoading(true);
                try {
                    // 1. Fetch Prices
                    const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=zcash,solana&vs_currencies=usd&include_24hr_change=true');
                    const priceData = await priceRes.json();
                    setPrices(priceData);

                    // 2. Fetch Chart Data (ZEC)
                    const chartRes = await fetch('https://api.coingecko.com/api/v3/coins/zcash/market_chart?vs_currency=usd&days=1');
                    const chartJson = await chartRes.json();
                    if (chartJson.prices) {
                        // Extract just the prices, downsample to ~50 points for performance/smoothness
                        const rawPrices = chartJson.prices.map((p: any) => p[1]);
                        const downsampled = rawPrices.filter((_: any, i: number) => i % Math.floor(rawPrices.length / 50) === 0);
                        setChartData(downsampled);
                    }
                } catch (error) {
                    console.error("Failed to fetch crypto data:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [activeSlide]);

    // Helper to generate SVG path from data
    const getChartPath = (data: number[], width: number, height: number, closePath: boolean = false) => {
        if (!data.length) return "";
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;

        // Map points to SVG coordinates
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            // Invert Y because SVG 0 is top
            const y = height - ((val - min) / range) * height;
            return `${x.toFixed(1)} ${y.toFixed(1)}`;
        });

        let path = `M ${points[0]}`;
        for (let i = 1; i < points.length; i++) {
            // Simple line to next point (could do bezier for smoothness but straight lines are safer for now)
            path += ` L ${points[i]}`;
        }

        if (closePath) {
            path += ` L ${width} ${height} L 0 ${height} Z`;
        }

        return path;
    };
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
                                        {/* ZEC CARD */}
                                        <div className="bg-[#18181a] p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-xs">Z</div>
                                                <span className="font-bold">ZEC / USD</span>
                                            </div>
                                            <div className="text-2xl font-mono font-bold">
                                                {prices ? `$${prices.zcash.usd.toLocaleString()}` : '...'}
                                            </div>
                                            <div className={`text-xs ${prices?.zcash.usd_24h_change && prices.zcash.usd_24h_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {prices ? `${prices.zcash.usd_24h_change.toFixed(2)}% (24h)` : '--'}
                                            </div>
                                        </div>

                                        {/* SOL CARD */}
                                        <div className="bg-[#18181a] p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400"></div>
                                                <span className="font-bold">SOL / USD</span>
                                            </div>
                                            <div className="text-2xl font-mono font-bold">
                                                {prices ? `$${prices.solana.usd.toLocaleString()}` : '...'}
                                            </div>
                                            <div className={`text-xs ${prices?.solana.usd_24h_change && prices.solana.usd_24h_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {prices ? `${prices.solana.usd_24h_change.toFixed(2)}% (24h)` : '--'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-[#18181a] rounded-xl border border-white/5 p-4 flex flex-col">
                                        <div className="text-sm font-medium text-gray-400 mb-4">Live Price Chart (ZEC)</div>
                                        <div className="flex-1 relative w-full h-full min-h-[200px]">
                                            {loading || chartData.length === 0 ? (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs animate-pulse">
                                                    Loading market data...
                                                </div>
                                            ) : (
                                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                                    <defs>
                                                        <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                                                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                                                            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                    {/* Line */}
                                                    <path
                                                        d={getChartPath(chartData, 100, 100)}
                                                        fill="none"
                                                        stroke="#f97316"
                                                        strokeWidth="2"
                                                        vectorEffect="non-scaling-stroke"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    {/* Fill Area */}
                                                    <path
                                                        d={getChartPath(chartData, 100, 100, true)}
                                                        fill="url(#chart-gradient)"
                                                        stroke="none"
                                                    />
                                                </svg>
                                            )}
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
