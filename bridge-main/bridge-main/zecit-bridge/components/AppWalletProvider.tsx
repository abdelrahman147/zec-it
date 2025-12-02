'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter, CoinbaseWalletAdapter, TrustWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

export default function AppWalletProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Mainnet;

    // You can also provide a custom RPC endpoint.
    // Use the environment variable if available, otherwise fall back to PublicNode (reliable public RPC).
    const endpoint = useMemo(() => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://solana-rpc.publicnode.com", [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new CoinbaseWalletAdapter(),
            new TrustWalletAdapter(),
            // OKX Wallet usually injects itself as a standard wallet or mimics Phantom/Solflare, 
            // but we can try to include it if a specific adapter exists, or rely on standard detection.
            // For now, we add standard ones.
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
