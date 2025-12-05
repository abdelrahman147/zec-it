const https = require('https');

const RELAY_API_URL = 'https://api.relay.link';
const USER_ADDRESS = '0x0000000000000000000000000000000000000000'; // Dummy

function request(method, endpoint, body) {
    return new Promise((resolve, reject) => {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const req = https.request(`${RELAY_API_URL}${endpoint}`, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, data: data });
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function probe() {
    const endpoints = [
        { method: 'GET', url: `/users/${USER_ADDRESS}/balances` },
        { method: 'GET', url: `/users/${USER_ADDRESS}/portfolio` },
        { method: 'POST', url: `/users/${USER_ADDRESS}/balances` },
        { method: 'POST', url: `/balances`, body: { user: USER_ADDRESS } },
        { method: 'POST', url: `/portfolio`, body: { user: USER_ADDRESS } },
        { method: 'POST', url: `/currencies/v2`, body: { user: USER_ADDRESS } }, // Try user param
        { method: 'POST', url: `/currencies/v2`, body: { wallet: USER_ADDRESS } }, // Try wallet param
        { method: 'POST', url: `/currencies/v2`, body: { address: USER_ADDRESS } }, // This is likely contract address, but maybe...
    ];

    for (const ep of endpoints) {
        console.log(`\nTesting ${ep.method} ${ep.url} ${ep.body ? JSON.stringify(ep.body) : ''}`);
        try {
            const res = await request(ep.method, ep.url, ep.body);
            console.log(`Result: ${res.status}`);
            if (res.status === 200) {
                console.log('SUCCESS DATA:', res.data.substring(0, 100));
            }
        } catch (e) {
            console.log('Error:', e.message);
        }
    }
}

probe();
