'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowDown, Settings, History, Info, Wallet, X, ChevronDown, ExternalLink, Copy, QrCode, RefreshCw, ArrowRight, ArrowRightLeft, Check, Loader2, Activity, TrendingUp, User, BarChart3, Sliders, Globe, ChevronRight, Clock, Bell, Lock, LogOut, ArrowLeft } from 'lucide-react';
import { getExchangeQuote, createExchangeTrade, getExchangeStatus } from '@/app/actions/simpleswap';
import { getCryptoPrices } from '@/app/actions/cmc';
import UniswapStyleWalletModal from './UniswapStyleWalletModal';
import { useZcashSnap } from '@/hooks/useZcashSnap';
import QRCode from 'react-qr-code';

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
    const { connected, publicKey, connect, disconnect, select, wallets, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [activeTab, setActiveTab] = useState('Bridge');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [amount, setAmount] = useState(''); // Unified amount state
    const [quoteAmount, setQuoteAmount] = useState<string>('--'); // Unified quote state
    const [recipientAddress, setRecipientAddress] = useState(''); // Manual recipient address
    const [direction, setDirection] = useState<'ZEC_TO_SOL' | 'SOL_TO_ZEC'>('ZEC_TO_SOL');
    const [selectedSolToken, setSelectedSolToken] = useState('sol'); // 'sol', 'usdc', etc.
    const [trade, setTrade] = useState<any>(null);
    const [tradeStatus, setTradeStatus] = useState<string>('');
    const [modalOpen, setModalOpen] = useState(false);
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [prices, setPrices] = useState<{ zec: number; sol: number } | null>(null);
    const { isInstalled: zecInstalled, address: zecAddress, connect: connectZec, sendTransaction: sendZec, snapSupported, error: zecError, isLoading: zecLoading } = useZcashSnap();

    // Handle Zcash Errors
    useEffect(() => {
        if (zecError) {
            alert(`Zcash Connection Error: ${zecError}`);
        }
    }, [zecError]);

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
    // Fetch SOL Balance - REMOVED since we are manual now
    // useEffect(() => {
    //     if (connected && publicKey) {
    //         connection.getBalance(publicKey).then(balance => {
    //             setSolBalance(balance / LAMPORTS_PER_SOL);
    //         }).catch(e => console.error("Failed to fetch balance", e));
    //     } else {
    //         setSolBalance(null);
    //     }
    // }, [connected, publicKey, connection]);

    const [quoteError, setQuoteError] = useState<string | null>(null);

    // Debounce quote fetching
    useEffect(() => {
        const fetchQuote = async () => {
            setQuoteError(null);
            if (!amount || isNaN(parseFloat(amount))) {
                setQuoteAmount('--');
                return;
            }
            const inputAmount = parseFloat(amount);
            if (inputAmount > 0) {
                const from = direction === 'ZEC_TO_SOL' ? 'zec' : selectedSolToken;
                const to = direction === 'ZEC_TO_SOL' ? selectedSolToken : 'zec';

                const result = await getExchangeQuote(inputAmount, from, to);
                if (result && result.value !== undefined) {
                    setQuoteAmount(result.value.toFixed(4));
                } else if (result && result.error) {
                    setQuoteAmount('--');
                    setQuoteError(result.error);
                } else {
                    setQuoteAmount('--');
                }
            }
        };

        const timeoutId = setTimeout(fetchQuote, 500);
        return () => clearTimeout(timeoutId);
    }, [amount, direction, selectedSolToken]);

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
        // Validation: Ensure amount and recipient address are present
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!recipientAddress) {
            alert('Please enter a recipient address');
            return;
        }

        setLoading(true);

        try {
            const from = direction === 'ZEC_TO_SOL' ? 'zec' : selectedSolToken;
            const to = direction === 'ZEC_TO_SOL' ? selectedSolToken : 'zec';

            // Use manual recipient address
            const recipient = recipientAddress;

            const tradeData = await createExchangeTrade(parseFloat(amount), recipient, from, to);

            if (!tradeData) {
                alert('Failed to create trade. Please check your API key and try again.');
                return;
            }

            if ('error' in tradeData) {
                alert(`Trade Error: ${tradeData.error}`);
                return;
            }

            setTrade(tradeData);
            setTradeStatus('waiting');

            // We are not auto-sending transactions anymore.
            // The user will manually send funds to the deposit address.
            setTradeStatus('waiting');

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

    const toggleDirection = () => {
        setDirection(prev => prev === 'ZEC_TO_SOL' ? 'SOL_TO_ZEC' : 'ZEC_TO_SOL');
        // Swap amounts logic if needed, or just clear
        setAmount('');
        setQuoteAmount('--');
    };

    // Main Content Component Switcher
    const renderContent = () => {
        switch (activeTab) {
            case 'History': return <HistoryView />;
            case 'Analytics': return <AnalyticsView />;
            case 'Settings': return <SettingsView />;
            case 'Bridge':
            default:
                // If trade is active, show the Status View (SimpleSwap style)
                if (trade) {
                    return (
                        <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6">
                            {/* Status Header */}
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-white">
                                    {tradeStatus === 'waiting' ? 'Awaiting your deposit' :
                                        tradeStatus === 'confirming' ? 'Confirming' :
                                            tradeStatus === 'exchanging' ? 'Exchanging' :
                                                tradeStatus === 'sending' ? 'Sending' : 'Finished'}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {tradeStatus === 'waiting' ? 'Send the funds to the address below' :
                                        tradeStatus === 'exchanging' ? 'Your coins are safe and being exchanged' :
                                            tradeStatus === 'sending' ? 'Coins are on the way' :
                                                'Exchange completed successfully'}
                                </p>
                            </div>

                            {/* Main Status Card */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                {/* Deposit Section (Only when waiting) */}
                                {tradeStatus === 'waiting' && (
                                    <div className="p-8 border-b border-white/5 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Send deposit:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-bold text-white">{trade.inAmount} {trade.inCurrency.toUpperCase()}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded ${trade.inCurrency === 'zec' ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-500'}`}>
                                                    {trade.inCurrency.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-[#141414] rounded-xl p-6 flex flex-col items-center gap-6">
                                            <div className="bg-white p-3 rounded-xl">
                                                {/* QR Code */}
                                                <QRCode
                                                    value={trade.inAddress}
                                                    size={160}
                                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                    viewBox={`0 0 256 256`}
                                                />
                                            </div>
                                            <div className="w-full">
                                                <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 px-4 py-3 rounded-xl w-full">
                                                    <span className="text-sm font-mono text-white truncate flex-1">{trade.inAddress}</span>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(trade.inAddress)}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                    >
                                                        <Copy size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                                            <Info className="text-blue-400 shrink-0" size={20} />
                                            <p className="text-sm text-blue-200/80">
                                                If you sent the coins and the status did not change immediately, do not worry. Our system needs a few minutes to detect the transaction.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Progress Stepper */}
                                <div className="p-8 border-b border-white/5">
                                    <div className="relative flex justify-between items-center px-4">
                                        {/* Line Background */}
                                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/5 -z-10 mx-8"></div>
                                        {[
                                            { id: 'waiting', label: 'Pending deposit' },
                                            { id: 'confirming', label: 'Confirming' },
                                            { id: 'exchanging', label: 'Exchanging' },
                                            { id: 'sending', label: 'Sending' }
                                        ].map((step) => {
                                            const isActive = tradeStatus === step.id;
                                            const stepIndex = ['waiting', 'confirming', 'exchanging', 'sending'].indexOf(step.id);
                                            const currentIndex = ['waiting', 'confirming', 'exchanging', 'sending', 'finished'].indexOf(tradeStatus);
                                            const isCompleted = currentIndex > stepIndex || tradeStatus === 'finished';

                                            return (
                                                <div key={step.id} className="flex flex-col items-center gap-3 bg-[#0a0a0a] px-2 z-10">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isActive || isCompleted ? 'border-green-500 bg-green-500 text-black' : 'border-gray-700 bg-[#141414] text-gray-500'
                                                        }`}>
                                                        {isCompleted ? <Check size={14} strokeWidth={3} /> :
                                                            isActive ? <Loader2 size={14} className="animate-spin" /> :
                                                                <div className="w-2 h-2 rounded-full bg-current" />}
                                                    </div>
                                                    <span className={`text-xs font-medium ${isActive || isCompleted ? 'text-green-500' : 'text-gray-600'}`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Operation Details */}
                                <div className="p-8 space-y-4">
                                    <h3 className="text-sm font-medium text-white mb-4">Operation details</h3>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">You sent:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono">{trade.inAmount} {trade.inCurrency.toUpperCase()}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${trade.inCurrency === 'zec' ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-500'}`}>
                                                {trade.inCurrency.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Deposit address:</span>
                                        <div className="flex items-center gap-2 bg-[#141414] px-3 py-1.5 rounded-lg max-w-[200px] md:max-w-xs">
                                            <span className="text-xs text-gray-400 truncate">{trade.inAddress}</span>
                                            <Copy size={12} className="text-gray-500 cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(trade.inAddress)} />
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/5 my-2"></div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">You get:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono">≈ {trade.outAmount} {trade.outCurrency.toUpperCase()}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${trade.outCurrency === 'zec' ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-500'}`}>
                                                {trade.outCurrency.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Recipient address:</span>
                                        <div className="flex items-center gap-2 bg-[#141414] px-3 py-1.5 rounded-lg max-w-[200px] md:max-w-xs">
                                            <span className="text-xs text-gray-400 truncate">{recipientAddress}</span>
                                            <Copy size={12} className="text-gray-500 cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(recipientAddress)} />
                                        </div>
                                    </div>
                                </div>

                                {tradeStatus === 'finished' && (
                                    <div className="p-8 pt-0">
                                        <button
                                            onClick={() => { setTrade(null); setAmount(''); setRecipientAddress(''); }}
                                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
                                        >
                                            Create new exchange
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                // Default Input View (SimpleSwap style)
                return (
                    <div className="max-w-3xl mx-auto p-4 lg:p-8 flex flex-col gap-6">
                        <div className="text-center mb-4">
                            <h2 className="text-3xl font-bold text-white mb-2">Crypto Exchange</h2>
                            <p className="text-gray-400">Free from sign-up, limits, and complications</p>
                        </div>

                        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 shadow-2xl">
                            <div className="bg-[#141414] rounded-[20px] p-6 lg:p-8 space-y-6">
                                {/* You Send */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">You send</span>
                                        <span className="text-gray-500">
                                            {direction === 'ZEC_TO_SOL' ? 'Zcash Network' : 'Solana Network'}
                                        </span>
                                    </div>
                                    <div className="flex gap-4">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="flex-1 bg-transparent text-3xl font-bold text-white outline-none placeholder-gray-700 font-mono"
                                            placeholder="0.1"
                                        />
                                        <div className="flex items-center gap-2 bg-[#0a0a0a] px-4 py-2 rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-colors" onClick={toggleDirection}>
                                            {direction === 'ZEC_TO_SOL' ? (
                                                <>
                                                    <img src="https://static.simpleswap.io/images/currencies-logo/zec.svg" className="w-6 h-6 rounded-full" />
                                                    <span className="font-bold text-white">ZEC</span>
                                                </>
                                            ) : (
                                                <>
                                                    <img src="https://static.simpleswap.io/images/currencies-logo/sol.svg" className="w-6 h-6 rounded-full" />
                                                    <span className="font-bold text-white">SOL</span>
                                                </>
                                            )}
                                            <ChevronDown size={16} className="text-gray-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Divider / Switcher */}
                                <div className="relative h-px bg-white/5 my-4">
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#141414] p-2 rounded-full border border-white/5 cursor-pointer hover:text-orange-500 transition-colors" onClick={toggleDirection}>
                                        <ArrowRightLeft size={16} className="text-gray-500 rotate-90" />
                                    </div>
                                </div>

                                {/* You Get */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">You get</span>
                                        <span className="text-gray-500">
                                            {direction === 'ZEC_TO_SOL' ? 'Solana Network' : 'Zcash Network'}
                                        </span>
                                    </div>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            readOnly
                                            value={quoteAmount === '--' ? '≈ 0.00' : `≈ ${quoteAmount}`}
                                            className="flex-1 bg-transparent text-3xl font-bold text-gray-400 outline-none font-mono"
                                        />
                                        <div className="flex items-center gap-2 bg-[#0a0a0a] px-4 py-2 rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-colors" onClick={toggleDirection}>
                                            {direction === 'ZEC_TO_SOL' ? (
                                                <>
                                                    <img src="https://static.simpleswap.io/images/currencies-logo/sol.svg" className="w-6 h-6 rounded-full" />
                                                    <span className="font-bold text-white">SOL</span>
                                                </>
                                            ) : (
                                                <>
                                                    <img src="https://static.simpleswap.io/images/currencies-logo/zec.svg" className="w-6 h-6 rounded-full" />
                                                    <span className="font-bold text-white">ZEC</span>
                                                </>
                                            )}
                                            <ChevronDown size={16} className="text-gray-500" />
                                        </div>
                                    </div>
                                    {quoteError && (
                                        <p className="text-red-500 text-xs mt-2">{quoteError}</p>
                                    )}
                                </div>
                            </div>

                            {/* Recipient Address Section */}
                            <div className="p-6 lg:p-8 pt-0">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 ml-1">
                                        {direction === 'ZEC_TO_SOL' ? "The recipient's Solana address" : "The recipient's Zcash address"}
                                    </label>
                                    <div className="bg-[#141414] rounded-xl flex items-center px-4 py-3 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                                        <input
                                            type="text"
                                            value={recipientAddress}
                                            onChange={(e) => setRecipientAddress(e.target.value)}
                                            className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none font-mono text-sm"
                                            placeholder={direction === 'ZEC_TO_SOL' ? "Enter Solana address" : "Enter Zcash address"}
                                        />
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <QrCode size={20} className="hover:text-white cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBridge}
                                    disabled={loading || !amount || parseFloat(amount) <= 0 || !recipientAddress}
                                    className="w-full mt-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>Creating Exchange...</span>
                                        </>
                                    ) : (
                                        'Create an exchange'
                                    )}
                                </button>

                                <div className="flex justify-center gap-4 mt-6 text-xs text-gray-600">
                                    <a href="#" className="hover:text-gray-400">Privacy Policy</a>
                                    <span>•</span>
                                    <a href="#" className="hover:text-gray-400">Terms of Service</a>
                                </div>
                            </div>
                        </div>
                    </div>
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


        </div>
    );
};

export default BridgeInterface;
