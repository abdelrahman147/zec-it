'use client';

import React, { useState } from 'react';
import { Menu, Shield } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import UniswapStyleWalletModal from './UniswapStyleWalletModal';

interface NavbarProps {
  scrolled: boolean;
  onLaunchApp: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ scrolled, onLaunchApp }) => {
  const { connected, publicKey } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'top-0 md:top-4 px-0 md:px-4' : 'top-0 px-0'}`}>
      <nav
        className={`mx-auto flex justify-between items-center transition-all duration-500 ${scrolled
          ? 'max-w-5xl bg-[#0a0a0a]/90 md:bg-white/5 backdrop-blur-xl border-b md:border border-white/10 md:rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] py-4 px-6'
          : 'max-w-7xl bg-transparent py-6 px-4 sm:px-6 lg:px-8'
          }`}
      >
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Shield className="text-white w-4 h-4 fill-current" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Zecit</span>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {!connected ? (
            <button
              onClick={() => setModalOpen(true)}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-white font-mono">{publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}</span>
            </div>
          )}
          <button
            onClick={onLaunchApp}
            className={`px-6 py-2.5 rounded-full text-white text-sm font-medium border border-white/5 transition-all shadow-lg hover:scale-105 ${scrolled ? 'bg-white/10 hover:bg-white/20' : 'bg-[#2a2a2a] hover:bg-[#333]'}`}
          >
            Start now
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={20} />
        </button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 mx-4 p-4 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-4 md:hidden">
            {!connected ? (
              <button
                onClick={() => { setModalOpen(true); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-white font-mono">{publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}</span>
              </div>
            )}
            <button
              onClick={() => { onLaunchApp(); setMobileMenuOpen(false); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold hover:shadow-lg transition-all"
            >
              Start now
            </button>
          </div>
        )}

        <UniswapStyleWalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </nav>
    </div>
  );
};

export default Navbar;
