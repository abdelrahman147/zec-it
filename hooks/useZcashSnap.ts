import { useState, useCallback } from 'react';

const SNAP_ID = 'npm:@chainsafe/webzjs-zcash-snap';

export interface ZcashSnapState {
    isInstalled: boolean;
    address: string | null;
    isLoading: boolean;
    error: string | null;
    snapSupported: boolean;
}

export const useZcashSnap = () => {
    const [state, setState] = useState<ZcashSnapState>({
        isInstalled: false,
        address: null,
        isLoading: false,
        error: null,
        snapSupported: true, // Assume true initially
    });

    const connect = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            let provider = window.ethereum;

            // Handle multiple wallets (EIP-6963 / Legacy Array)
            // If multiple wallets are installed, window.ethereum might be the one that was "injected" last,
            // or it might be an array of providers. We need to find MetaMask specifically.
            if ((window.ethereum as any)?.providers) {
                // Try to find MetaMask, but don't strictly exclude others if they claim to be MetaMask.
                // Some wallets like OKX might support Snaps or we want to at least try them.
                provider = (window.ethereum as any).providers.find((p: any) => p.isMetaMask);
            }

            if (!provider) {
                // Fallback: check if the root provider is actually MetaMask and NOT OKX
                if (window.ethereum?.isMetaMask && !(window.ethereum as any)?.isOkxWallet) {
                    provider = window.ethereum;
                }
            }

            // If we still can't find a pure MetaMask provider, we will try to use whatever provider we have,
            // and if it fails with -32601, we mark snapSupported as false.
            if (!provider) {
                provider = window.ethereum;
            }

            if (!provider) {
                throw new Error("No wallet provider found");
            }

            // 1. Try to "wake up" the wallet with a standard connection request first.
            // This gives the user the "pop in my wallet" they expect.
            try {
                await provider.request({ method: 'eth_requestAccounts' });
            } catch (e) {
                console.warn("eth_requestAccounts failed, but proceeding to try Snap...", e);
            }

            // 2. Request Snap Installation with a timeout
            try {
                const snapRequest = provider.request({
                    method: 'wallet_requestSnaps',
                    params: {
                        [SNAP_ID]: {},
                    },
                });

                // Race against a timeout (e.g., 10 seconds)
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Connection timed out. Please check your wallet.")), 10000)
                );

                await Promise.race([snapRequest, timeoutPromise]);

            } catch (e: any) {
                // Code -32601 means method not found (Snaps not supported)
                // This happens with OKX Wallet, Trust Wallet, etc.
                if (e.code === -32601 || e.message?.includes('does not exist')) {
                    console.warn("Snaps not supported by this wallet. Falling back to Deep Link.");
                    setState(prev => ({ ...prev, isLoading: false, snapSupported: false }));
                    return null;
                }
                throw e;
            }

            // 2. Get Account
            // Try 'getAccount' which is a common pattern for Snaps
            const result = await provider.request({
                method: 'wallet_invokeSnap',
                params: {
                    snapId: SNAP_ID,
                    request: { method: 'getAccount' },
                },
            });

            console.log('Snap Result:', result);

            // The result structure depends on the Snap.
            // It might be an object with { address: ... } or { account: { address: ... } }
            // We will try to extract a string that looks like a Zcash address
            let address = null;
            if (typeof result === 'string') {
                address = result;
            } else if (typeof result === 'object' && result !== null) {
                address = (result as any).address || (result as any).unifiedAddress || (result as any).transparentAddress || (result as any).saplingAddress;
            }

            if (!address) {
                // Try viewing key as backup check
                try {
                    await provider.request({
                        method: 'wallet_invokeSnap',
                        params: {
                            snapId: SNAP_ID,
                            request: { method: 'getViewingKey' },
                        },
                    });
                    // If this succeeds, we are connected but just can't get address.
                    // We'll treat this as "installed but address unavailable"
                    // For now, let's just throw to trigger error state
                    throw new Error("Connected but could not retrieve address");
                } catch (e) {
                    throw new Error('Failed to retrieve address from Zcash Snap');
                }
            }

            setState({
                isInstalled: true,
                address: address,
                isLoading: false,
                error: null,
                snapSupported: true
            });

            return address;

        } catch (err: any) {
            console.error('Zcash Snap Error Full:', err);
            console.error('Zcash Snap Error Message:', err.message);
            console.error('Zcash Snap Error Code:', err.code);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: err.message || 'Failed to connect to Zcash Snap',
            }));
            return null;
        }
    }, []);

    const sendTransaction = useCallback(async (to: string, amount: string, memo?: string) => {
        // NOTE: Without the @chainsafe/webzjs-wallet library, constructing the PCZT (Partially Constructed Zcash Transaction)
        // is extremely difficult to do manually.
        // For now, we will attempt to call a 'sendTransaction' RPC if it exists, or throw an error explaining the limitation.

        try {
            // Placeholder for actual send logic
            // In a real implementation with the library, we would build the tx here.
            // Since we lack the library, we might have to fallback or fail.

            throw new Error("Transaction construction requires @chainsafe/webzjs-wallet library which is currently unavailable. Please use the Manual Transfer option.");

        } catch (err: any) {
            console.error('Zcash Send Error:', err);
            throw err;
        }
    }, []);

    return {
        ...state,
        connect,
        sendTransaction
    };
};
