const RELAY_API_URL = 'https://api.relay.link';

async function testRelaySearch(term) {
    console.log(`Testing search for term: ${term}`);

    const endpoints = [
        '/currencies/v2/search',
        '/tokens/search',
        '/search',
        '/currencies/search'
    ];

    for (const endpoint of endpoints) {
        console.log(`\n--- Testing ${endpoint} ---`);
        try {
            const response = await fetch(`${RELAY_API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chainId: 792703809,
                    query: term,
                    term: term,
                    address: term
                })
            });

            console.log(`Status: ${response.status}`);
            if (response.ok) {
                const data = await response.json();
                console.log('SUCCESS!', JSON.stringify(data).slice(0, 100));
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}

testRelaySearch('6gdDALVM7FrTnXTXo17PpHnLtUdnaAtokCBzPUZKA2rx');
