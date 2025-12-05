const fetch = require('node-fetch');

const RELAY_API_URL = 'https://api.relay.link';

const SOLANA_CHAIN_ID = 792703809;
const BNB_CHAIN_ID = 56;
const SOL_ADDRESS = '11111111111111111111111111111111';
const EVM_ADDRESS = '0x0000000000000000000000000000000000000000';

// Mock tokens (we need valid token addresses)
// We can fetch them first or just use known ones if possible. 
// Let's fetch currencies first to get valid ones.

async function getTokens(chainId) {
    const response = await fetch(`${RELAY_API_URL}/currencies/v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chainIds: [chainId], limit: 1, verified: true })
    });
    const data = await response.json();
    return data[0];
}

async function testQuote(originChainId, destChainId, userAddress, label) {
    try {
        const originToken = await getTokens(originChainId);
        const destToken = await getTokens(destChainId);

        console.log(`Testing ${label}: ${originToken.symbol} (${originChainId}) -> ${destToken.symbol} (${destChainId}) with User: ${userAddress}`);

        const body = {
            user: userAddress,
            originChainId: originChainId,
            destinationChainId: destChainId,
            originCurrency: originToken.address,
            destinationCurrency: destToken.address,
            amount: "1000000", // Small amount
            tradeType: 'EXACT_INPUT'
        };

        const response = await fetch(`${RELAY_API_URL}/quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.json();
            console.log(`FAILED: ${err.message}`);
        } else {
            console.log(`SUCCESS`);
        }
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
    }
}

async function runTests() {
    // Case 1: Solana -> BNB, User = Solana
    await testQuote(SOLANA_CHAIN_ID, BNB_CHAIN_ID, SOL_ADDRESS, "Solana -> BNB (User: SOL)");

    // Case 2: Solana -> BNB, User = EVM
    await testQuote(SOLANA_CHAIN_ID, BNB_CHAIN_ID, EVM_ADDRESS, "Solana -> BNB (User: EVM)");

    // Case 3: BNB -> Solana, User = Solana
    await testQuote(BNB_CHAIN_ID, SOLANA_CHAIN_ID, SOL_ADDRESS, "BNB -> Solana (User: SOL)");

    // Case 4: BNB -> Solana, User = EVM
    await testQuote(BNB_CHAIN_ID, SOLANA_CHAIN_ID, EVM_ADDRESS, "BNB -> Solana (User: EVM)");
}

runTests();
