'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface ConfirmationBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    zecAmount: string;
    solAmount: string;
    prices: { zec: number; sol: number } | null;
    loading: boolean;
}

export default function ConfirmationBottomSheet({
    isOpen,
    onClose,
    onConfirm,
    zecAmount,
    solAmount,
    prices,
    loading
}: ConfirmationBottomSheetProps) {
    const [countdown, setCountdown] = useState(7);

    useEffect(() => {
        if (!isOpen) {
            setCountdown(7);
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    const exchangeRate = prices ? (prices.zec / prices.sol).toFixed(3) : '16.336';
    const zecUsdValue = prices && zecAmount ? (parseFloat(zecAmount) * prices.zec).toFixed(2) : '0.00';

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="translate-y-full"
                            enterTo="translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="translate-y-0"
                            leaveTo="translate-y-full"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-t-3xl bg-[#0a0a0a] border-t border-x border-white/10 text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-white/5">
                                    <Dialog.Title className="text-xl font-bold text-white">
                                        Confirm Order
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-6">
                                    {/* From Section */}
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">From</p>
                                        <div className="flex items-center justify-between bg-[#141414] p-4 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-lg">
                                                    Z
                                                </div>
                                                <span className="text-lg font-bold text-white">ZEC</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-white font-mono">{zecAmount || '0'}</p>
                                                <p className="text-xs text-gray-500">≈ ${zecUsdValue}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Exchange Rate */}
                                    <div className="flex items-center justify-center">
                                        <div className="bg-[#141414] px-4 py-2 rounded-lg border border-white/10">
                                            <p className="text-xs text-gray-400 flex items-center gap-2">
                                                1 ZEC = {exchangeRate} SOL
                                                <ArrowRight size={14} className="text-gray-600" />
                                            </p>
                                        </div>
                                    </div>

                                    {/* To Section */}
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">To</p>
                                        <div className="flex items-center justify-between bg-[#141414] p-4 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                                                    S
                                                </div>
                                                <span className="text-lg font-bold text-white">SOL</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-white font-mono">{solAmount || '0'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Details */}
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Type</span>
                                            <span className="text-sm text-white font-medium">Instant</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Max Slippage</span>
                                            <span className="text-sm text-white font-medium">Auto 0.5%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Transaction Fees</span>
                                            <span className="text-sm text-white font-medium">~0.5%</span>
                                        </div>
                                    </div>

                                    {/* Confirm Button */}
                                    <button
                                        onClick={onConfirm}
                                        disabled={loading || countdown > 0}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-black font-bold text-lg hover:shadow-[0_0_50px_rgba(249,115,22,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            'Processing...'
                                        ) : countdown > 0 ? (
                                            <>Confirm ({countdown}s)</>
                                        ) : (
                                            'Confirm'
                                        )}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
