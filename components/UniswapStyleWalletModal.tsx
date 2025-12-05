'use client';

import React, { useState, Fragment, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { ChevronDown, X, Smartphone, ExternalLink, Copy, LogOut, RefreshCw } from 'lucide-react';

interface UniswapStyleWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    chainType: 'solana' | 'evm';
    evmAddress: string | null;
    onConnectEvm: () => void;
    onDisconnectEvm: () => void;
}

export default function UniswapStyleWalletModal({
    isOpen,
    onClose,
    chainType,
    evmAddress,
    onConnectEvm,
    onDisconnectEvm
}: UniswapStyleWalletModalProps) {
    const { select, wallets, connected, publicKey, disconnect, wallet } = useWallet();
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState<'list' | 'connected'>('list');

    // Reset view when opening
    useEffect(() => {
        if (isOpen) {
            if (chainType === 'solana' && connected) {
                setView('connected');
            } else if (chainType === 'evm' && evmAddress) {
                setView('connected');
            } else {
                setView('list');
            }
        }
    }, [isOpen, chainType, connected, evmAddress]);

    const handleConnectSolana = (walletName: WalletName) => {
        select(walletName);
        onClose();
    };

    const handleDisconnect = () => {
        if (chainType === 'solana') {
            disconnect();
        } else {
            onDisconnectEvm();
        }
        onClose();
    };

    const handleChangeWallet = () => {
        if (chainType === 'solana') {
            disconnect();
        } else {
            onDisconnectEvm();
        }
        setView('list');
    };

    if (!isOpen) return null;

    // Filter Solana Wallets
    const filteredSolanaWallets = wallets.filter(w =>
        w.adapter.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const installedSolanaWallets = filteredSolanaWallets.filter(w => w.readyState === 'Installed');
    const otherSolanaWallets = filteredSolanaWallets.filter(w => w.readyState !== 'Installed');

    // Mock "Popular" wallets to populate the list if it's empty or small (Visual only)
    const popularWalletsMock = [
        { name: 'Trust', icon: 'https://wallet-adapter-assets.solana.com/icons/trust.svg' },
        { name: 'OKX Wallet', icon: 'https://wallet-adapter-assets.solana.com/icons/okx.png' },
        { name: 'Ronin Wallet', icon: 'https://wallet-adapter-assets.solana.com/icons/ronin.svg' },
        { name: 'Brave Wallet', icon: 'https://wallet-adapter-assets.solana.com/icons/brave.svg' },
    ].filter(mock => !wallets.find(w => w.adapter.name === mock.name)); // Don't show if actually present

    // EVM Wallets List
    const allEvmWallets = [
        { name: 'Browser Wallet', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg', id: 'injected', detected: true },
        { name: 'MetaMask', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg', id: 'metamask' },
        { name: 'Trust Wallet', icon: 'https://wallet-adapter-assets.solana.com/icons/trust.svg', id: 'trust' },
        { name: 'Coinbase Wallet', icon: 'https://images.ctfassets.net/q5ulk4bp65r7/1rFQCqoq8hipvVJSKDU3f3/21ab733af7a8ab404e29b873ffb28348/coinbase-icon2.svg', id: 'coinbase' },
        { name: 'OKX Wallet', icon: 'https://wallet-adapter-assets.solana.com/icons/okx.png', id: 'okx' },
        { name: 'Rainbow', icon: 'https://avatars.githubusercontent.com/u/48327834?s=200&v=4', id: 'rainbow' },
        { name: 'Rabby Wallet', icon: 'https://assets.website-files.com/627a39d5e87663d95393a55f/627a39d5e87663367d93a58c_Rabby_Logo_Icon.svg', id: 'rabby' },
        { name: 'Zerion', icon: 'https://zerion.io/favicon.ico', id: 'zerion' },
        { name: 'Phantom', icon: 'https://wallet-adapter-assets.solana.com/icons/phantom.svg', id: 'phantom' },
        { name: 'WalletConnect', icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg', id: 'walletconnect', disabled: true },
    ];

    const filteredEvmWallets = allEvmWallets.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderConnectedView = () => {
        const address = chainType === 'solana' ? publicKey?.toBase58() : evmAddress;
        const walletName = chainType === 'solana' ? wallet?.adapter.name : 'EVM Wallet';
        const walletIcon = chainType === 'solana' ? wallet?.adapter.icon : 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg';

        return (
            <div className="text-center">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <img src={walletIcon} alt={walletName} className="w-20 h-20 rounded-[2rem] mb-4 shadow-xl" />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{walletName}</h3>
                    <div className="flex items-center gap-2 mt-2 bg-gray-100 px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer" onClick={() => navigator.clipboard.writeText(address || '')}>
                        <span className="text-sm text-gray-600 font-mono font-medium">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                        <Copy size={14} className="text-gray-400" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleChangeWallet}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-900 font-semibold transition-all"
                    >
                        <RefreshCw size={24} className="text-gray-500" />
                        Change Wallet
                    </button>
                    <button
                        onClick={handleDisconnect}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition-all"
                    >
                        <LogOut size={24} />
                        Disconnect
                    </button>
                </div>
            </div>
        );
    };

    const renderListView = () => {
        return (
            <>
                {/* Search Bar */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3.5 border-none rounded-2xl leading-5 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:text-sm transition-all font-medium"
                        placeholder={`Search through ${chainType === 'solana' ? wallets.length : allEvmWallets.length} wallets...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {chainType === 'solana' ? (
                        <>
                            {installedSolanaWallets.map((wallet) => (
                                <button
                                    key={wallet.adapter.name}
                                    onClick={() => handleConnectSolana(wallet.adapter.name)}
                                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-10 h-10 rounded-xl" />
                                        <span className="font-bold text-gray-900 text-lg">{wallet.adapter.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#5C5CFF]"></div>
                                        Installed
                                    </span>
                                </button>
                            ))}

                            {otherSolanaWallets.map((wallet) => (
                                <button
                                    key={wallet.adapter.name}
                                    onClick={() => handleConnectSolana(wallet.adapter.name)}
                                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                                >
                                    <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-10 h-10 rounded-xl grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                    <span className="font-bold text-gray-500 group-hover:text-gray-900 transition-colors text-lg">{wallet.adapter.name}</span>
                                </button>
                            ))}

                            {/* Mock Popular Wallets (Visual Filler) */}
                            {popularWalletsMock.map((wallet) => (
                                <button
                                    key={wallet.name}
                                    disabled
                                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group opacity-50 cursor-not-allowed"
                                >
                                    <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 rounded-xl grayscale" />
                                    <span className="font-bold text-gray-400 text-lg">{wallet.name}</span>
                                </button>
                            ))}
                        </>
                    ) : (
                        // EVM Wallets
                        <>
                            {filteredEvmWallets.map((wallet) => (
                                <button
                                    key={wallet.id}
                                    onClick={() => {
                                        if (!wallet.disabled) {
                                            onConnectEvm();
                                            onClose();
                                        }
                                    }}
                                    disabled={wallet.disabled}
                                    className={`w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group ${wallet.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 rounded-xl" />
                                        <div className="text-left">
                                            <div className={`font-bold text-lg ${wallet.disabled ? 'text-gray-400' : 'text-gray-900'}`}>{wallet.name}</div>
                                        </div>
                                    </div>
                                    {wallet.detected && (
                                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#5C5CFF]"></div>
                                            Detected
                                        </span>
                                    )}
                                    {wallet.disabled && (
                                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                                            Soon
                                        </span>
                                    )}
                                </button>
                            ))}

                            {filteredEvmWallets.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No wallets found
                                </div>
                            )}
                        </>
                    )}
                </div>
            </>
        );
    };

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
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
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
                            <Dialog.Panel className="w-full max-w-[420px] transform overflow-hidden rounded-[32px] bg-white p-6 text-left align-middle shadow-2xl transition-all font-sans">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-[22px] font-semibold text-gray-900 mx-auto">
                                        {view === 'connected' ? 'Account' : 'Connect a new wallet'}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="absolute right-6 top-6 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {view === 'connected' ? renderConnectedView() : renderListView()}

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
