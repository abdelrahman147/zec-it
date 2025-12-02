'use client';

import React, { useState, Fragment } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { ChevronDown, X, Smartphone, ExternalLink } from 'lucide-react';



export default function UniswapStyleWalletModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { select, wallets, connected, connect } = useWallet();
    const [showOther, setShowOther] = useState(false);

    const handleConnect = (walletName: WalletName) => {
        select(walletName);
        // The wallet adapter will handle the connection request automatically after selection if autoConnect is true,
        // or we might need to call connect() explicitly depending on the configuration.
        // Usually selecting is enough if the provider is set up right, but let's try to connect too just in case.
        // However, `connect` from useWallet is for the *selected* wallet.
        // So we select first. The effect in the provider might trigger connect.
        onClose();
    };

    const handlePhantomMobile = () => {
        window.open('https://phantom.app/ul/browse/dapps?app_url=https://zecit-bridge.vercel.app', '_blank');
    };

    if (!isOpen) return null;

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
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                                        Connect a wallet
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Top: App Sign-In (Phantom Mobile) */}
                                <button
                                    onClick={handlePhantomMobile}
                                    className="w-full flex items-center justify-center gap-3 p-4 mb-4 bg-gradient-to-r from-[#AB9FF2] to-[#C6B5F7] text-black rounded-xl hover:opacity-90 transition-opacity group"
                                >
                                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                        <Smartphone size={16} className="text-[#AB9FF2]" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm">Phantom Mobile</div>
                                        <div className="text-xs opacity-70">Sign in with the app</div>
                                    </div>
                                </button>

                                <div className="flex items-center justify-center mb-6 text-sm text-gray-500 gap-1">
                                    <span>Don't have a wallet?</span>
                                    <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-[#AB9FF2] hover:underline flex items-center gap-0.5">
                                        Get Phantom <ExternalLink size={10} />
                                    </a>
                                </div>

                                {/* Main Wallets List (Installed/Detected) */}
                                <div className="space-y-2 mb-4">
                                    {wallets.filter(w => w.readyState === 'Installed').map((wallet) => (
                                        <button
                                            key={wallet.adapter.name}
                                            onClick={() => handleConnect(wallet.adapter.name)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#141414] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
                                        >
                                            <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-8 h-8 rounded-lg" />
                                            <span className="font-medium text-white text-lg">{wallet.adapter.name}</span>
                                            <span className="ml-auto text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Detected</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Divider + Other Wallets */}
                                <div className="pt-4 border-t border-white/5">
                                    <Menu as="div" className="relative">
                                        <Menu.Button
                                            onClick={() => setShowOther(!showOther)}
                                            className="w-full flex justify-between items-center p-3 text-left text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                        >
                                            <span className="font-medium">Other wallets</span>
                                            <ChevronDown className={`w-5 h-5 transition-transform ${showOther ? 'rotate-180' : ''}`} />
                                        </Menu.Button>

                                        <Transition
                                            as={Fragment}
                                            show={showOther}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute w-full mt-2 origin-top bg-[#141414] border border-white/10 rounded-xl shadow-lg overflow-hidden z-20 max-h-60 overflow-y-auto custom-scrollbar">
                                                <div className="p-1 space-y-1">
                                                    {wallets.filter(w => w.readyState !== 'Installed').map((wallet) => (
                                                        <Menu.Item key={wallet.adapter.name}>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => handleConnect(wallet.adapter.name)}
                                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${active ? 'bg-white/5 text-white' : 'text-gray-400'
                                                                        }`}
                                                                >
                                                                    <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-8 h-8 rounded-lg" />
                                                                    <span className="font-medium">{wallet.adapter.name}</span>
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    ))}
                                                </div>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>

                                {/* Footer */}
                                <p className="text-[10px] text-gray-600 mt-6 text-center leading-relaxed">
                                    By connecting a wallet, you agree to ZEC-SOL Bridge's <a href="#" className="hover:text-gray-400 underline">Terms of Service</a> and consent to its <a href="#" className="hover:text-gray-400 underline">Privacy Policy</a>.
                                </p>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
