'use server';

const CMC_API_KEY = process.env.CMC_API_KEY;
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest';

interface CMCPriceResponse {
    data: {
        [key: string]: Array<{
            quote: {
                USD: {
                    price: number;
                };
            };
        }>;
    };
}

export async function getCryptoPrices(): Promise<{ zec: number; sol: number } | null> {
    if (!CMC_API_KEY) {
        console.error('CMC API key not configured');
        return null;
    }

    try {
        const response = await fetch(
            `${CMC_API_URL}?symbol=ZEC,SOL`,
            {
                headers: {
                    'X-CMC_PRO_API_KEY': CMC_API_KEY,
                },
                cache: 'no-store',
                next: { revalidate: 60 }, // Cache for 60 seconds
            }
        );

        if (!response.ok) {
            console.error('CMC API Error:', response.status, await response.text());
            return null;
        }

        const data: CMCPriceResponse = await response.json();

        return {
            zec: data.data.ZEC[0].quote.USD.price,
            sol: data.data.SOL[0].quote.USD.price,
        };
    } catch (error) {
        console.error('CMC API Exception:', error);
        return null;
    }
}
