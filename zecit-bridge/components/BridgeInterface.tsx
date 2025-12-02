'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowDown, Settings, History, Info, Wallet, X, ChevronDown, ExternalLink, Copy, QrCode, RefreshCw, ArrowRight, ArrowRightLeft, Check, Loader2, Activity, TrendingUp, User, BarChart3, Sliders, Globe, ChevronRight, Clock, Bell, Lock, LogOut, ArrowLeft } from 'lucide-react';
import { getExchangeQuote, createExchangeTrade, getExchangeStatus } from '@/app/actions/simpleswap';
import { getCryptoPrices } from '@/app/actions/cmc';
import UniswapStyleWalletModal from './UniswapStyleWalletModal';
import ConfirmationBottomSheet from './ConfirmationBottomSheet';
import { useZcashSnap } from '@/hooks/useZcashSnap';

// --- TAB COMPONENTS ---
const HistoryView = () => (
    <div className="w-full h-full p-4 lg:p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-5 p-4 border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <div>Type</div>
                <div>Amount</div>
                <div>Date</div>
                <div>Status</div>
                <div className="text-right">Hash</div>
            </div>
            {/* TODO: Fetch transaction history from backend */}
            <div className="p-8 text-center text-gray-500">
                No transactions found.
            </div>
        </div>
    </div>
);

const AnalyticsView = () => (
    <div className="w-full h-full p-4 lg:p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Network Analytics</h2>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Lock size={40} className="text-orange-500" />
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Value Locked</p>
                <h3 className="text-3xl font-bold text-white">--</h3>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-2">
                    <TrendingUp size={12} /> --% this week
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity size={40} className="text-purple-500" />
                </div>
                <p className="text-sm text-gray-500 mb-1">24h Volume</p>
                <h3 className="text-3xl font-bold text-white">--</h3>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                    Updated just now
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <User size={40} className="text-blue-500" />
                </div>
                <p className="text-sm text-gray-500 mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-white">--</h3>
                <div className="flex items-center gap-1 text-xs text-green-500 mt-2">
                    <TrendingUp size={12} /> -- new today
                </div>
            </div>
        </div>

        {/* Mock Chart Area */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 h-[400px] flex flex-col justify-center items-center text-center">
            <BarChart3 size={48} className="text-gray-700 mb-4" />
            <h4 className="text-lg font-medium text-gray-300">Volume Chart Visualization</h4>
            <p className="text-sm text-gray-600 max-w-xs mt-2">
                Detailed charting data is loading from the sub-graph. This area typically displays daily bridge volume across networks.
            </p>
        </div>
    </div>
);

const SettingsView = () => (
    <div className="w-full h-full p-4 lg:p-8 overflow-y-auto max-w-4xl">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

        <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Sliders size={18} className="text-gray-400" /> General Configuration
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-white">Slippage Tolerance</p>
                            <p className="text-xs text-gray-500">Your transaction will revert if the price changes unfavorably by more than this percentage.</p>
                        </div>
                        <div className="flex bg-[#141414] rounded-lg p-1 border border-white/10">
                            {['0.1%', '0.5%', '1.0%'].map(val => (
                                <button key={val} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${val === '0.5%' ? 'bg-orange-500 text-black' : 'text-gray-400 hover:text-white'}`}>
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-white">Transaction Deadline</p>
                            <p className="text-xs text-gray-500">Minutes transaction is valid for.</p>
                        </div>
                        <div className="w-20 bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-right text-sm text-white font-mono">
                            20
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Globe size={18} className="text-gray-400" /> RPC & Network
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-white">Solana RPC Endpoint</p>
                        </div>
                        <select className="bg-[#141414] border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-orange-500/50">
                            <option>Mainnet Beta (Helius)</option>
                            <option>Mainnet Beta (Triton)</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-white">Zcash Node</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-400">Lightwalletd (North America)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

interface BridgeInterfaceProps {
    onBack: () => void;
}

// --- THE REAL BRIDGE INTERFACE ---
const BridgeInterface: React.FC<BridgeInterfaceProps> = ({ onBack }) => {
    const { connected, publicKey, connect, disconnect, select, wallets } = useWallet();
    const { connection } = useConnection();
    const [activeTab, setActiveTab] = useState('Bridge');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [zecAmount, setZecAmount] = useState('');
    const [solAmount, setSolAmount] = useState<string>('--');
    const [trade, setTrade] = useState<any>(null);
    const [tradeStatus, setTradeStatus] = useState<string>('');
    const [modalOpen, setModalOpen] = useState(false);
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [prices, setPrices] = useState<{ zec: number; sol: number } | null>(null);
    const [showConfirmSheet, setShowConfirmSheet] = useState(false);
    const { isInstalled: zecInstalled, address: zecAddress, connect: connectZec, sendTransaction: sendZec, snapSupported } = useZcashSnap();

    // Fetch crypto prices
    useEffect(() => {
        const fetchPrices = async () => {
            const priceData = await getCryptoPrices();
            if (priceData) {
                setPrices(priceData);
            }
        };
        fetchPrices();
        const intervalId = setInterval(fetchPrices, 60000); // Update every 60 seconds
        return () => clearInterval(intervalId);
    }, []);

    // Fetch SOL Balance
    useEffect(() => {
        if (connected && publicKey) {
            connection.getBalance(publicKey).then(balance => {
                setSolBalance(balance / LAMPORTS_PER_SOL);
            }).catch(e => console.error("Failed to fetch balance", e));
        } else {
            setSolBalance(null);
        }
    }, [connected, publicKey, connection]);

    // Debounce quote fetching
    useEffect(() => {
        const fetchQuote = async () => {
            if (!zecAmount || isNaN(parseFloat(zecAmount))) {
                console.log('No valid ZEC amount, setting SOL to --');
                setSolAmount('--');
                return;
            }
            const amount = parseFloat(zecAmount);
            console.log('Fetching quote for ZEC amount:', amount);
            if (amount > 0) {
                const quote = await getExchangeQuote(amount);
                console.log('Received quote:', quote);
                if (quote) {
                    setSolAmount(quote.toFixed(4));
                } else {
                    console.error('Quote was null!');
                    setSolAmount('--');
                }
            }
        };

        const timeoutId = setTimeout(fetchQuote, 500);
        return () => clearTimeout(timeoutId);
    }, [zecAmount]);

    // Poll trade status
    useEffect(() => {
        if (!trade || tradeStatus === 'finished') return;

        const pollStatus = async () => {
            const status = await getExchangeStatus(trade.id);
            if (status) {
                setTradeStatus(status);
                if (status === 'finished') {
                    setSuccess(true);
                    setLoading(false);
                }
            }
        };

        const intervalId = setInterval(pollStatus, 10000); // Poll every 10s
        return () => clearInterval(intervalId);
    }, [trade, tradeStatus]);

    const handleBridge = async () => {
        if (!connected || !publicKey) {
            alert('Please connect your Solana wallet first');
            return;
        }

        // Only require ZEC connection if Snap is supported
        if (snapSupported && !zecAddress) {
            alert('Please connect your Zcash wallet first');
            return;
        }

        if (!zecAmount || parseFloat(zecAmount) <= 0) {
            alert('Please enter a valid ZEC amount');
            return;
        }

        setLoading(true);
        setShowConfirmSheet(false); // Close sheet if open

        try {
            const tradeData = await createExchangeTrade(parseFloat(zecAmount), publicKey.toBase58());

            if (!tradeData) {
                alert('Failed to create trade. Please check your API key and try again.');
                return;
            }

            setTrade(tradeData);
            setTradeStatus('waiting');

            // Attempt to send via Snap if supported
            if (snapSupported && zecAddress) {
                try {
                    await sendZec(tradeData.inAddress, tradeData.inAmount.toString(), tradeData.extraId);
                    // If successful, the UI will update via polling
                } catch (err: any) {
                    console.error("Snap send failed:", err);
                    // Fallback to manual/deep link
                    const okxDeepLink = `okx://wallet/transfer?chain=zcash&to=${tradeData.inAddress}&amount=${tradeData.inAmount}${tradeData.extraId ? '&memo=' + encodeURIComponent(tradeData.extraId) : ''}`;
                    alert("Please confirm the transaction in your wallet. If the popup didn't appear, use the manual transfer details below.");
                }
            } else {
                // Snap not supported (e.g. OKX Wallet), auto-trigger Deep Link or just let user see details
                const okxDeepLink = `okx://wallet/transfer?chain=zcash&to=${tradeData.inAddress}&amount=${tradeData.inAmount}${tradeData.extraId ? '&memo=' + encodeURIComponent(tradeData.extraId) : ''}`;
                window.open(okxDeepLink, '_blank');
            }

            // Start polling for status
            const pollInterval = setInterval(async () => {
                const status = await getExchangeStatus(tradeData.id);
                if (status) {
                    setTradeStatus(status);
                    if (status === 'finished' || status === 'failed') {
                        clearInterval(pollInterval);
                        if (status === 'finished') {
                            setSuccess(true);
                        }
                    }
                }
            }, 10000);
        } catch (error) {
            console.error("Bridge error:", error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Main Content Component Switcher
    const renderContent = () => {
        switch (activeTab) {
            case 'History': return <HistoryView />;
            case 'Analytics': return <AnalyticsView />;
            case 'Settings': return <SettingsView />;
            case 'Bridge':
            default:
                return (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full p-4 lg:p-8 overflow-y-auto">
                        {/* Left Column: Massive Bridge Interface */}
                        <div className="lg:col-span-8 flex flex-col gap-4">
                            {/* FROM Section */}
                            <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col justify-center relative group hover:border-orange-500/20 transition-all duration-500 min-h-[220px]">
                                <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none rounded-r-3xl"></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#141414] border border-white/5 text-gray-400">
                                        <span className="text-[10px] uppercase tracking-wider font-semibold">Asset to Bridge</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Available Balance</p>
                                        <p className="text-sm font-mono text-white">-- ZEC</p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-end md:items-center gap-4 relative z-10">
                                    <div className="flex-1 w-full">
                                        <input
                                            type="number"
                                            value={zecAmount}
                                            onChange={(e) => setZecAmount(e.target.value)}
                                            className="w-full bg-transparent text-5xl lg:text-6xl font-bold text-white placeholder-gray-800 outline-none font-mono tracking-tighter"
                                            placeholder="0.000"
                                            step="0.001"
                                            min="0"
                                        />
                                        <p className="text-gray-500 mt-1 text-sm">
                                            ≈ ${prices && zecAmount ? (parseFloat(zecAmount) * prices.zec).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'} USD
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 bg-[#141414] pl-3 pr-5 py-2.5 rounded-2xl border border-white/10 hover:bg-[#1a1a1a] cursor-pointer transition-colors shrink-0">
                                        <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold">Z</div>
                                        <div className="text-left">
                                            <p className="font-bold text-base leading-none">ZEC</p>
                                            <p className="text-[10px] text-gray-500">Zcash Network</p>
                                        </div>
                                        <ChevronRight className="ml-1 text-gray-600" size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Connector */}
                            <div className="relative h-2 flex items-center justify-center">
                                <div className="absolute w-10 h-10 rounded-xl bg-[#141414] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-orange-500 cursor-pointer transition-all z-20">
                                    <ArrowRightLeft className="rotate-90" size={16} />
                                </div>
                                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            </div>

                            {/* TO Section */}
                            <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col justify-center relative group hover:border-purple-500/20 transition-all duration-500 min-h-[220px]">
                                <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-purple-500/5 to-transparent pointer-events-none rounded-r-3xl"></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#141414] border border-white/5 text-gray-400">
                                        <span className="text-[10px] uppercase tracking-wider font-semibold">Receive On</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Current Balance</p>
                                        <p className="text-sm font-mono text-white">{solBalance !== null ? `${solBalance.toFixed(4)} SOL` : '--'}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-end md:items-center gap-4 relative z-10">
                                    <div className="flex-1 w-full">
                                        <input
                                            type="text"
                                            readOnly
                                            value={solAmount}
                                            className="w-full bg-transparent text-5xl lg:text-6xl font-bold text-white/50 outline-none font-mono tracking-tighter"
                                        />
                                        <p className="text-gray-500 mt-1 text-sm">
                                            1 ZEC ≈ {prices ? (prices.zec / prices.sol).toFixed(3) : '16.336'} SOL
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 bg-[#141414] pl-3 pr-5 py-2.5 rounded-2xl border border-white/10 hover:bg-[#1a1a1a] cursor-pointer transition-colors shrink-0">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400 flex items-center justify-center text-white font-bold">S</div>
                                        <div className="text-left">
                                            <p className="font-bold text-base leading-none">SOL</p>
                                            <p className="text-[10px] text-gray-500">Solana Network</p>
                                        </div>
                                        <ChevronRight className="ml-1 text-gray-600" size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Action Bar */}
                            {!trade ? (
                                !connected || (snapSupported && !zecAddress) ? (
                                    <div className="flex flex-col md:flex-row gap-3">
                                        {snapSupported && !zecAddress && (
                                            <button
                                                onClick={connectZec}
                                                className="flex-1 py-5 rounded-2xl bg-[#f5a623] text-black font-bold text-lg hover:shadow-[0_0_50px_rgba(245,166,35,0.3)] transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                                            >
                                                <Wallet size={20} /> Connect Zcash
                                            </button>
                                        )}
                                        {!connected && (
                                            <button
                                                onClick={() => setModalOpen(true)}
                                                className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_50px_rgba(124,58,237,0.3)] transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                                            >
                                                <Wallet size={20} /> Connect Solana
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowConfirmSheet(true)}
                                        disabled={!zecAmount || parseFloat(zecAmount) <= 0}
                                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-black font-bold text-lg hover:shadow-[0_0_50px_rgba(249,115,22,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.99]"
                                    >
                                        Preview
                                    </button>
                                )
                            ) : (
                                <div className="bg-[#1A1B1E] rounded-3xl p-6 border border-white/5 shadow-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white">Transaction Details</h3>
                                        {/* Optional Close/Expand button could go here */}
                                    </div>

                                    {/* Asset Swap Summary */}
                                    <div className="flex items-center justify-between bg-[#141517] p-4 rounded-xl mb-6 border border-white/5">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <img src="https://static.simpleswap.io/images/currencies-logo/zec.svg" alt="ZEC" className="w-6 h-6 rounded-full" />
                                                <span className="text-gray-400 font-medium">ZEC</span>
                                            </div>
                                            <span className="text-xl font-bold text-white">{trade.inAmount} ZEC</span>
                                        </div>

                                        <ArrowRight className="text-gray-500 w-5 h-5" />

                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-2 mb-1">
                                                <img src="https://static.simpleswap.io/images/currencies-logo/sol.svg" alt="SOL" className="w-6 h-6 rounded-full" />
                                                <span className="text-gray-400 font-medium">Solana</span>
                                            </div>
                                            <span className="text-xl font-bold text-white">{trade.outAmount.toFixed(4)} SOL</span>
                                        </div>
                                    </div>

                                    {/* Vertical Timeline */}
                                    <div className="relative pl-4 space-y-8 mb-8">
                                        {/* Connecting Line */}
                                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-800 -z-10"></div>

                                        {/* Step 1: Send ZEC */}
                                        <div className="flex gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tradeStatus === 'waiting' ? 'bg-blue-500/20 text-blue-500 ring-2 ring-blue-500/50' : 'bg-[#2C2D31] text-gray-500'
                                                }`}>
                                                <img src="https://static.simpleswap.io/images/currencies-logo/zec.svg" alt="ZEC" className="w-5 h-5 opacity-80" />
                                            </div>
                                            <div className="flex flex-col pt-1 w-full">
                                                <span className="text-white font-medium">Send ZEC on Zcash Network</span>
                                                {tradeStatus === 'waiting' && (
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={() => window.open(`okx://wallet/transfer?chain=zcash&to=${trade.inAddress}&amount=${trade.inAmount}${trade.extraId ? '&memo=' + encodeURIComponent(trade.extraId) : ''}`, '_blank')}
                                                            className="flex items-center gap-2 text-blue-400 text-sm hover:text-blue-300 transition-colors font-medium"
                                                        >
                                                            Confirm in Okxwallet
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        </button>

                                                        {/* Manual Fallback Toggle */}
                                                        <div className="mt-3 p-3 bg-[#141517] rounded-lg border border-white/5">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-xs text-gray-500">Didn't pop up?</span>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => navigator.clipboard.writeText(trade.inAddress)}
                                                                        className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-2 py-1 rounded transition-colors"
                                                                    >
                                                                        Copy Address
                                                                    </button>
                                                                    <button
                                                                        onClick={() => navigator.clipboard.writeText(trade.inAmount.toString())}
                                                                        className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-2 py-1 rounded transition-colors"
                                                                    >
                                                                        Copy Amount
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-gray-400 break-all font-mono bg-black/20 p-2 rounded">
                                                                {trade.inAddress}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {tradeStatus !== 'waiting' && <span className="text-sm text-green-500 flex items-center gap-1 mt-1"><Check className="w-3 h-3" /> Sent</span>}
                                            </div>
                                        </div>

                                        {/* Step 2: Processing */}
                                        <div className="flex gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${['confirming', 'exchanging', 'sending'].includes(tradeStatus) ? 'bg-blue-500/20 text-blue-500 ring-2 ring-blue-500/50' : 'bg-[#2C2D31] text-gray-500'
                                                }`}>
                                                <ArrowRightLeft className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <span className={`font-medium ${['confirming', 'exchanging', 'sending'].includes(tradeStatus) ? 'text-white' : 'text-gray-500'}`}>
                                                    Relay processes your transaction
                                                </span>
                                                {['confirming', 'exchanging', 'sending'].includes(tradeStatus) && (
                                                    <span className="text-sm text-blue-400 animate-pulse mt-1">Processing...</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Step 3: Receive SOL */}
                                        <div className="flex gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tradeStatus === 'finished' ? 'bg-green-500/20 text-green-500 ring-2 ring-green-500/50' : 'bg-[#2C2D31] text-gray-500'
                                                }`}>
                                                <img src="https://static.simpleswap.io/images/currencies-logo/sol.svg" alt="SOL" className="w-5 h-5 opacity-80" />
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <span className={`font-medium ${tradeStatus === 'finished' ? 'text-white' : 'text-gray-500'}`}>
                                                    Receive SOL on Solana
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="border-t border-white/5 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Max Slippage</span>
                                            <span className="text-gray-300">Auto 0.5%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Rate</span>
                                            <span className="text-gray-300">1 ZEC ≈ {(trade.outAmount / trade.inAmount).toFixed(4)} SOL</span>
                                        </div>
                                    </div>
                                </div>
                            )
                            }
                        </div >

                        {/* Right Column: Info & History */}
                        <div className="lg:col-span-4 flex flex-col gap-6" >
                            {/* Network Status Card */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-5 relative overflow-hidden" >
                                <h3 className="text-gray-400 text-sm font-medium mb-4 flex items-center gap-2">
                                    <Activity size={16} /> Network Status
                                </h3>
                                <div className="space-y-3 relative z-10">
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#141414]">
                                        <span className="text-xs text-gray-500">Congestion</span>
                                        <span className="text-green-400 text-xs font-medium">Low</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#141414]">
                                        <span className="text-xs text-gray-500">Est. Time</span>
                                        <span className="text-white text-xs font-medium">~2 mins</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#141414]">
                                        <span className="text-xs text-gray-500">Max Slippage</span>
                                        <span className="text-white text-xs font-medium">0.5%</span>
                                    </div>
                                </div>
                            </div >

                            {/* Recent Transactions List */}
                            <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-3xl p-5 flex flex-col" >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-gray-400 text-sm font-medium flex items-center gap-2">
                                        <Clock size={16} /> Recent Activity
                                    </h3>
                                    <button className="text-[10px] text-orange-500 hover:text-orange-400">View All</button>
                                </div>

                                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                    {/* TODO: Fetch recent activity from backend */}
                                    <div className="p-4 text-center text-xs text-gray-500">
                                        No recent activity.
                                    </div>
                                </div>
                            </div >
                        </div >
                    </div >
                );
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black overflow-hidden">
            {/* Sidebar Navigation - Desktop/Tablet */}
            <div className="hidden md:flex w-20 lg:w-64 bg-[#0a0a0a] border-r border-white/5 flex-col justify-between py-6">
                <div>
                    <div className="flex items-center gap-3 px-6 mb-10 cursor-pointer" onClick={onBack}>
                        <ArrowLeft className="text-gray-400 hover:text-white transition-colors" size={24} />
                        <span className="text-lg font-bold text-white hidden lg:block">Back</span>
                    </div>

                    <div className="space-y-2 px-3">
                        {[
                            { id: 'Bridge', icon: Wallet, label: 'Bridge' },
                            { id: 'Analytics', icon: BarChart3, label: 'Analytics' },
                            { id: 'History', icon: Clock, label: 'History' },
                            { id: 'Settings', icon: Settings, label: 'Settings' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                    ? 'bg-orange-500/10 text-orange-500'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium hidden lg:block">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400"></div>
                        <div className="hidden lg:block">
                            <p className="text-xs text-gray-400">{connected ? 'Connected' : 'Not Connected'}</p>
                            <p className="text-sm font-mono text-white">{connected && publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : '--'}</p>
                        </div>
                        {connected && (
                            <button
                                onClick={disconnect}
                                className="ml-auto p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Disconnect Wallet"
                            >
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Top Bar */}
            <div className="md:hidden h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 z-20 shrink-0">
                <div className="flex items-center gap-3" onClick={onBack}>
                    <ArrowLeft className="text-gray-400" size={20} />
                    <span className="font-bold text-white text-lg">{activeTab}</span>
                </div>
                <div className="flex items-center gap-3">
                    {/* Mobile Wallet Indicator */}
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <Bell size={20} className="text-gray-400" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-black relative overflow-hidden">
                <div className="hidden md:flex h-16 border-b border-white/5 items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md z-10 shrink-0">
                    <h2 className="text-xl font-bold text-white">{activeTab}</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-green-500 font-medium">Mainnet Active</span>
                        </div>
                        <Bell size={20} className="text-gray-400 hover:text-white cursor-pointer" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto relative pb-20 md:pb-0">
                    {renderContent()}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/5 z-50 flex justify-around p-4 pb-6 safe-area-bottom">
                {[
                    { id: 'Bridge', icon: Wallet, label: 'Bridge' },
                    { id: 'Analytics', icon: BarChart3, label: 'Analytics' },
                    { id: 'History', icon: Clock, label: 'History' },
                    { id: 'Settings', icon: Settings, label: 'Settings' }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center gap-1 ${activeTab === item.id
                            ? 'text-orange-500'
                            : 'text-gray-500'
                            }`}
                    >
                        <item.icon size={24} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                ))}
            </div>

            <UniswapStyleWalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

            <ConfirmationBottomSheet
                isOpen={showConfirmSheet}
                onClose={() => setShowConfirmSheet(false)}
                onConfirm={async () => {
                    setShowConfirmSheet(false);
                    await handleBridge();
                }}
                zecAmount={zecAmount}
                solAmount={solAmount}
                prices={prices}
                loading={loading}
            />
        </div>
    );
};

export default BridgeInterface;
