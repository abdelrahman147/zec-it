const fetch = require('node-fetch');

async function checkRelayCurrencies() {
    try {
        const response = await fetch('https://api.relay.link/currencies/v2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chainIds: [1],
                limit: 5,
                verified: true
            })
        });
        const data = await response.json();
        console.log('Currencies:', JSON.stringify(data.slice(0, 3), null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

checkRelayCurrencies();
