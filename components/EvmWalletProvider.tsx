'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultConfig,
    RainbowKitProvider,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import {
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
    trustWallet,
    coinbaseWallet,
    okxWallet,
    ledgerWallet,
    phantomWallet,
    injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider } from 'wagmi';
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    bsc,
    avalanche,
} from 'wagmi/chains';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";

const config = getDefaultConfig({
    appName: 'ZecIt Bridge',
    projectId: '3a8170812b534d0ff9d794f19a901d64', // Public testing ID, user should replace
    chains: [mainnet, polygon, optimism, arbitrum, base, bsc, avalanche],
    ssr: true,
    wallets: [
        {
            groupName: 'Popular',
            wallets: [
                injectedWallet,
                metaMaskWallet,
                rainbowWallet,
                walletConnectWallet,
                coinbaseWallet,
                trustWallet,
            ],
        },
        {
            groupName: 'More',
            wallets: [
                okxWallet,
                ledgerWallet,
                phantomWallet,
            ],
        },
    ],
});

const queryClient = new QueryClient();

export default function EvmWalletProvider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
