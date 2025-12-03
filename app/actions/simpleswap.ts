'use server';

const API_KEY = process.env.SIMPLESWAP_API_KEY || 'your_api_key';
const API_URL = 'https://api.simpleswap.io'; // Base URL

interface QuoteResponse {
    estimatedAmount: number;
    minAmount: number;
    maxAmount: number;
}

interface TradeResponse {
    id: string;
    inAddress: string;
    inCurrency: string;
    outCurrency: string;
    inAmount: number;
    outAmount: number;
    status: string;
    extraId?: string; // Memo for ZEC
}

export async function getExchangeQuote(amount: number, fromCurrency: string = 'zec', toCurrency: string = 'sol'): Promise<{ value?: number; error?: string } | null> {
    console.log(`[SimpleSwap] getExchangeQuote called with amount: ${amount}, from: ${fromCurrency}, to: ${toCurrency}`);

    if (!amount) return { value: 0 };

    // Check if API key is the placeholder
    // Check if API key is the placeholder
    if (API_KEY === 'your_api_key') {
        console.error('[SimpleSwap] ERROR: No API Key provided. Cannot fetch real quotes.');
        return { error: 'Server configuration error: Missing API Key' };
    }

    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            fixed: 'false',
            currency_from: fromCurrency,
            currency_to: toCurrency,
            amount: amount.toString()
        });

        const url = `${API_URL}/get_estimated?${params.toString()}`;
        // console.log('[SimpleSwap] Fetching:', url); // Log removed for security

        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[SimpleSwap] Quote Error:', response.status, errorText);
            try {
                const errorJson = JSON.parse(errorText);
                return { error: errorJson.description || errorJson.message || 'Error fetching quote' };
            } catch {
                return { error: `API Error: ${response.status}` };
            }
        }

        const responseText = await response.text();
        console.log('[SimpleSwap] Raw quote response:', responseText);

        let estimatedAmount: number;

        // Try parsing as JSON first (handles "123.45" or 123.45)
        try {
            const json = JSON.parse(responseText);
            if (typeof json === 'number') {
                estimatedAmount = json;
            } else if (typeof json === 'string') {
                estimatedAmount = parseFloat(json);
            } else if (json && (json.description || json.message)) {
                return { error: json.description || json.message };
            } else {
                estimatedAmount = parseFloat(responseText.replace(/['"]/g, ''));
            }
        } catch (e) {
            // If not JSON, try parsing raw text, removing quotes if present
            estimatedAmount = parseFloat(responseText.replace(/['"]/g, ''));
        }

        if (isNaN(estimatedAmount)) {
            return { error: `Invalid API response: ${responseText.substring(0, 50)}` };
        }

        return { value: estimatedAmount };
    } catch (error) {
        console.error('[SimpleSwap] Quote Exception:', error);
        return { error: 'Network error' };
    }
}

export async function createExchangeTrade(amount: number, recipientAddress: string, fromCurrency: string = 'zec', toCurrency: string = 'sol'): Promise<TradeResponse | { error: string } | null> {
    // Mock response
    // Check if API key is the placeholder
    if (API_KEY === 'your_api_key') {
        console.error('[SimpleSwap] ERROR: No API Key provided. Cannot create real trade.');
        return { error: 'Server configuration error: Missing API Key' };
    }

    try {
        const body = {
            currency_from: fromCurrency,
            currency_to: toCurrency,
            amount: amount,
            address_to: recipientAddress,
            fixed: false
        };

        const url = `${API_URL}/create_exchange?api_key=${API_KEY}`;
        // console.log('[SimpleSwap] Creating trade:', url); // Log removed for security
        console.log('[SimpleSwap] Body:', JSON.stringify(body));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[SimpleSwap] Create Trade Error:', response.status, errorText);
            try {
                const errorJson = JSON.parse(errorText);
                return { error: errorJson.message || errorJson.description || 'Failed to create trade' };
            } catch (e) {
                return { error: `API Error: ${response.status} ${response.statusText}` };
            }
        }

        const data = await response.json();
        console.log('[SimpleSwap] Trade created:', data);

        return {
            id: data.id,
            inAddress: data.address_from,
            inCurrency: data.currency_from,
            outCurrency: data.currency_to,
            inAmount: Number(data.amount_from),
            outAmount: Number(data.amount_to),
            status: data.status,
            extraId: data.extra_id_from
        };
    } catch (error) {
        console.error('[SimpleSwap] Create Trade Exception:', error);
        return { error: 'Network error or exception' };
    }
}

export async function getExchangeStatus(tradeId: string): Promise<string | null> {
    if (!tradeId) {
        return null;
    }

    // Mock response
    if (tradeId.startsWith('mock_trade_')) {
        // Simulate progression
        const statuses = ['waiting', 'confirming', 'exchanging', 'sending', 'finished'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        return randomStatus;
    }

    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            id: tradeId
        });

        const response = await fetch(`${API_URL}/get_exchange?${params.toString()}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.status;
    } catch (error) {
        return null;
    }
}
