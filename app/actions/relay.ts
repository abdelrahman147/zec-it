'use server';

const RELAY_API_URL = 'https://api.relay.link';

export interface RelayChain {
    id: number;
    name: string;
    displayName: string;
    icon?: string;
}

export interface RelayCurrency {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    chainId: number;
    logoURI?: string;
    verified?: boolean;
}

export interface RelayQuoteRequest {
    user: string;
    originChainId: number;
    destinationChainId: number;
    originCurrency: string;
    destinationCurrency: string;
    amount: string; // atomic amount
    tradeType: 'EXACT_INPUT' | 'EXACT_OUTPUT';
    recipient?: string;
}

export interface RelayQuoteResponse {
    steps: any[];
    fees: any;
    details: {
        currencyIn: { amount: string; symbol: string };
        currencyOut: { amount: string; symbol: string };
        rate: string;
    };
}

export async function getRelayChains(): Promise<RelayChain[]> {
    try {
        const response = await fetch(`${RELAY_API_URL}/chains`, {
            cache: 'force-cache',
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (!response.ok) throw new Error('Failed to fetch chains');
        const data = await response.json();

        return (data.chains || []).map((chain: any) => ({
            ...chain,
            // Use DefiLlama's dynamic icon API based on chain name
            icon: `https://icons.llamao.fi/icons/chains/rsz_${chain.name}?w=48&h=48`
        }));
    } catch (error) {
        console.error('Relay Chains Error:', error);
        return [];
    }
}

export async function getRelayCurrencies(chainId?: number, term?: string): Promise<RelayCurrency[]> {
    try {
        const body: any = {
            chainIds: chainId ? [chainId] : undefined,
            limit: term ? 20 : 100,
            verified: !term // If searching, allow unverified tokens
        };

        if (term) {
            body.term = term;
            body.address = term; // Try passing as address too if it looks like one, or just rely on 'term'
        }

        const response = await fetch(`${RELAY_API_URL}/currencies/v2`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            cache: 'no-store', // Don't cache search results
        });

        if (!response.ok) throw new Error('Failed to fetch currencies');
        const data = await response.json();

        return data.map((item: any) => ({
            address: item.address,
            symbol: item.symbol,
            name: item.name,
            decimals: item.decimals,
            chainId: item.chainId,
            logoURI: item.metadata?.logoURI
        }));
    } catch (error) {
        console.error('Relay Currencies Error:', error);
        return [];
    }
}

export async function getRelayQuote(request: RelayQuoteRequest): Promise<RelayQuoteResponse | { error: string }> {
    try {
        const response = await fetch(`${RELAY_API_URL}/quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
            cache: 'no-store'
        });

        if (!response.ok) {
            const err = await response.json();
            return { error: err.message || 'Failed to fetch quote' };
        }

        return await response.json();
    } catch (error) {
        console.error('Relay Quote Error:', error);
        return { error: 'Network error' };
    }
}

export async function getRelayUserBalance(
    chainId: number,
    currency: string,
    user: string
): Promise<string> {
    try {
        // Use a dummy destination to get a quote.
        let destChainId = 8453; // Base
        let destCurrency = '0x0000000000000000000000000000000000000000'; // ETH

        if (chainId === 8453) {
            destChainId = 10; // Optimism
            destCurrency = '0x0000000000000000000000000000000000000000'; // ETH
        }

        const request: RelayQuoteRequest = {
            user,
            originChainId: chainId,
            destinationChainId: destChainId,
            originCurrency: currency,
            destinationCurrency: destCurrency,
            amount: '100000', // Small amount
            tradeType: 'EXACT_INPUT',
            recipient: user
        };

        const response = await fetch(`${RELAY_API_URL}/quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
            cache: 'no-store'
        });

        if (!response.ok) {
            return '0';
        }

        const data = await response.json();
        return data.userBalance || '0';
    } catch (error) {
        console.error('Relay Balance Error:', error);
        return '0';
    }
}
