const fetch = require('node-fetch');

async function checkRelayChains() {
    try {
        const response = await fetch('https://api.relay.link/chains');
        const data = await response.json();
        console.log('First chain full object:', JSON.stringify(data.chains[0], null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

checkRelayChains();
