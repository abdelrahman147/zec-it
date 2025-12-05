const RELAY_API_URL = 'https://api.relay.link';

async function probeTokens() {
    console.log('Fetching tokens for Solana...');
    try {
        const response = await fetch(`${RELAY_API_URL}/currencies/v2`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chainIds: [792703809],
                limit: 100,
                depositAddressOnly: true
            })
        });

        if (!response.ok) {
            console.error('Status:', response.status);
            return;
        }

        const data = await response.json();
        console.log('Fetched count:', data.length);

        const targetAddress = '6gdDALVM7FrTnXTXo17PpHnLtUdnaAtokCBzPUZKA2rx';
        const found = data.find(t => t.address === targetAddress);

        if (found) {
            console.log('FOUND TOKEN!');
            console.log(JSON.stringify(found, null, 2));
        } else {
            console.log('Token NOT found in the first 1000 results.');
            // Check if any token has "Smart Pocket" name
            const foundName = data.find(t => t.name.includes('Smart Pocket'));
            if (foundName) {
                console.log('Found by name:', JSON.stringify(foundName, null, 2));
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

probeTokens();
