// Test API endpoint to debug SimpleSwap
import { NextResponse } from 'next/server';

export async function GET() {
    const API_KEY = process.env.SIMPLESWAP_API_KEY || 'your_api_key';

    try {
        const validAddress = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV';

        const body = {
            api_key: API_KEY,
            fixed: false,
            currency_from: 'zec',
            currency_to: 'sol',
            amount: 0.1,
            address_to: validAddress,
            user_refund_address: ''
        };

        const url = `https://api.simpleswap.io/create_exchange?api_key=${API_KEY}`; // API key might be needed in URL too?
        // Or maybe just in body? The docs usually say query param for key.
        // Let's try both or just URL.

        console.log('[TEST] Fetching:', url);
        console.log('[TEST] Body:', JSON.stringify(body));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const text = await response.text();
        console.log('[TEST] Response status:', response.status);
        console.log('[TEST] Response body:', text);

        let jsonData;
        try {
            jsonData = JSON.parse(text);
        } catch (e) {
            jsonData = null;
        }

        return NextResponse.json({
            success: response.ok,
            status: response.status,
            data: jsonData || text,
            raw: text
        });
    } catch (error: any) {
        console.error('[TEST] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
