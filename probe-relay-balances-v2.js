const https = require('https');

const RELAY_API_URL = 'https://api.relay.link';
const USER_ADDRESS = '0x0000000000000000000000000000000000000000';

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

async function run() {
    // Try with 'address' param which returned 200
    const body = {
        address: USER_ADDRESS,
        includeAllChains: true
    };
    console.log('Probing POST /currencies/v2 with address param...');
    const res = await request('POST', '/currencies/v2', body);
    console.log('Status:', res.status);
    require('fs').writeFileSync('relay_currencies_output.json', res.data);
    console.log('Saved to relay_currencies_output.json');
}

run();
