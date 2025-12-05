const https = require('https');
const fs = require('fs');

const RELAY_API_URL = 'https://api.relay.link';

function post(endpoint, body) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const req = https.request(`${RELAY_API_URL}${endpoint}`, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error('Parse error:', data);
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    const quoteReq = {
        user: '11111111111111111111111111111111',
        recipient: '0x0000000000000000000000000000000000000000',
        originChainId: 792703809,
        destinationChainId: 8453,
        originCurrency: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        destinationCurrency: '0x0000000000000000000000000000000000000000',
        amount: '0',
        tradeType: 'EXACT_INPUT'
    };

    console.log('Fetching quote with amount 0...');
    const quote = await post('/quote', quoteReq);

    fs.writeFileSync('relay_quote_output.json', JSON.stringify(quote, null, 2));
    console.log('Quote saved to relay_quote_output.json');
}

run();
