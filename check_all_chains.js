const fetch = require('node-fetch');

async function getAllRelayChains() {
    try {
        const response = await fetch('https://api.relay.link/chains');
        const data = await response.json();
        const simplified = data.chains.map(c => `${c.id}: ${c.name}`);
        console.log(JSON.stringify(simplified, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

getAllRelayChains();
