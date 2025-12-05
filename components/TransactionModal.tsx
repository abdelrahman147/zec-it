'use client';

import React from 'react';
import { X, Check, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface TokenInfo {
    symbol: string;
    amount: string;
    logoURI?: string;
}

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: 'pending' | 'success' | 'error';
    step?: 'signing' | 'confirming'; // signing = wallet interaction, confirming = on-chain
    sentToken: TokenInfo;
    receivedToken: TokenInfo;
    txHash?: string;
    chainId?: number;
    error?: string;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
    isOpen,
    onClose,
    status,
    step,
    sentToken,
    receivedToken,
    txHash,
    chainId,
    error
}) => {
    if (!isOpen) return null;

    const getExplorerLink = (hash: string, chainId?: number) => {
        if (!chainId) return '#';
        // Simple mapping, can be expanded
        if (chainId === 792703809 || chainId === 9286185) return `https://solscan.io/tx/${hash}`; // Solana
        if (chainId === 1) return `https://etherscan.io/tx/${hash}`;
        if (chainId === 8453) return `https://basescan.org/tx/${hash}`;
        if (chainId === 10) return `https://optimistic.etherscan.io/tx/${hash}`;
        if (chainId === 42161) return `https://arbiscan.io/tx/${hash}`;
        if (chainId === 56) return `https://bscscan.com/tx/${hash}`;
        return '#';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1a1b1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col items-center text-center">

                    {/* STATUS ICON */}
                    <div className="mb-6">
                        {status === 'pending' && (
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* Optional: Wallet icon or small logo could go here */}
                                </div>
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                <Check size={32} strokeWidth={3} />
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                <AlertCircle size={32} strokeWidth={3} />
                            </div>
                        )}
                    </div>

                    {/* STATUS TEXT */}
                    <h2 className="text-xl font-bold text-white mb-2">
                        {status === 'pending' && (step === 'signing' ? 'Confirm in Wallet' : 'Processing Transaction')}
                        {status === 'success' && 'Transaction Completed'}
                        {status === 'error' && 'Transaction Failed'}
                    </h2>

                    {status === 'pending' && (
                        <p className="text-gray-400 mb-6">
                            {step === 'signing'
                                ? `Please sign the transaction in your wallet to swap ${sentToken.symbol} to ${receivedToken.symbol}.`
                                : `Waiting for transaction confirmation...`
                            }
                        </p>
                    )}

                    {status === 'error' && (
                        <p className="text-red-400 mb-6 text-sm bg-red-500/10 p-3 rounded-lg w-full break-words">
                            {error || 'An unknown error occurred.'}
                        </p>
                    )}

                    {/* TRANSACTION DETAILS (Visible on Success, or maybe always if we want) */}
                    {(status === 'success' || status === 'pending') && (
                        <div className="w-full bg-[#141517] rounded-xl p-4 mb-6 border border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-500 text-sm">Sent</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-medium">{sentToken.amount} {sentToken.symbol}</span>
                                    {sentToken.logoURI && (
                                        <img src={sentToken.logoURI} alt={sentToken.symbol} className="w-5 h-5 rounded-full" />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 text-sm">Received</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-medium">{receivedToken.amount} {receivedToken.symbol}</span>
                                    {receivedToken.logoURI && (
                                        <img src={receivedToken.logoURI} alt={receivedToken.symbol} className="w-5 h-5 rounded-full" />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex gap-3 w-full">
                        {status === 'success' && txHash && (
                            <a
                                href={getExplorerLink(txHash, chainId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 px-4 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={18} />
                                View Details
                            </a>
                        )}

                        <button
                            onClick={onClose}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${status === 'success'
                                    ? 'bg-[#6366f1] text-white hover:bg-[#5558dd]'
                                    : 'bg-gray-800 text-white hover:bg-gray-700'
                                }`}
                        >
                            {status === 'success' ? 'Done' : 'Close'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;
