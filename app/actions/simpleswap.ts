'use server';

const API_KEY = process.env.SIMPLESWAP_API_KEY || 'your_api_key';
const API_URL = 'https://api.simpleswap.io/v3';

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

export async function getExchangeQuote(amount: number, fromCurrency: string = 'zec', toCurrency: string = 'sol'): Promise<number | null> {
    console.log(`[SimpleSwap] getExchangeQuote called with amount: ${amount}, from: ${fromCurrency}, to: ${toCurrency}`);

    if (!amount) return 0;

    // Mock response if no API key or for testing
    if (API_KEY === 'your_api_key') {
        console.log('[SimpleSwap] Using mock response');
        // Mock rate logic
        if (fromCurrency === 'zec' && toCurrency === 'sol') return amount * 16.336;
        if (fromCurrency === 'sol' && toCurrency === 'zec') return amount / 16.336;
        return amount; // 1:1 fallback
    }

    try {
        const params = new URLSearchParams({
            api_key: API_KEY,
            fixed: 'false',
            currency_from: fromCurrency,
            currency_to: toCurrency,
            amount: amount.toString()
        });

        const url = `https://api.simpleswap.io/get_estimated?${params.toString()}`;
        console.log('[SimpleSwap] Fetching:', url);

        const response = await fetch(url, { cache: 'no-store' });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[SimpleSwap] Quote Error:', response.status, errorText);
            return null;
        }

        // API returns JSON string like "0.0063175"
        const estimatedAmount = await response.json();
        console.log('[SimpleSwap] Quote response:', estimatedAmount, 'type:', typeof estimatedAmount);

        // Parse string or number
        const result = typeof estimatedAmount === 'string' ? Number(estimatedAmount) : estimatedAmount;
        console.log('[SimpleSwap] Parsed result:', result);
        return result;
    } catch (error) {
        console.error('[SimpleSwap] Quote Exception:', error);
        return null;
    }
}

export async function createExchangeTrade(amount: number, recipientAddress: string, fromCurrency: string = 'zec', toCurrency: string = 'sol'): Promise<TradeResponse | null> {
    // Mock response
    if (API_KEY === 'your_api_key') {
        return {
            id: 'mock_trade_' + Math.random().toString(36).substring(7),
            inAddress: fromCurrency === 'zec' ? 't1d2...mock_zec_address' : 'SolanaMockAddress...',
            inCurrency: fromCurrency,
            outCurrency: toCurrency,
            inAmount: amount,
            outAmount: amount * (fromCurrency === 'zec' ? 16.336 : 1 / 16.336),
            status: 'waiting',
            extraId: fromCurrency === 'zec' ? '12345678' : undefined
        };
    }

    try {
        const body = {
            api_key: API_KEY,
            fixed: false,
            currency_from: fromCurrency,
            currency_to: toCurrency,
            amount: amount,
            address_to: recipientAddress,
            user_refund_address: ''
        };

        const url = `https://api.simpleswap.io/create_exchange?api_key=${API_KEY}`;
        console.log('[SimpleSwap] Creating trade:', url);
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
            return null;
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
        return null;
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

        const response = await fetch(`https://api.simpleswap.io/get_exchange?${params.toString()}`, {
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
