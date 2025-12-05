const fetch = require('node-fetch');

const RELAY_API_URL = 'https://api.relay.link';
const SOLANA_CHAIN_ID = 792703809;
const BNB_CHAIN_ID = 56;
const SOL_ADDRESS = '11111111111111111111111111111111';
const EVM_ADDRESS = '0x0000000000000000000000000000000000000000';

async function getTokens(chainId) {
    const response = await fetch(`${RELAY_API_URL}/currencies/v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chainIds: [chainId], limit: 1, verified: true })
    });
    const data = await response.json();
    return data[0];
}

async function testQuote(originChainId, destChainId, userAddress, recipientAddress, label) {
    try {
        const originToken = await getTokens(originChainId);
        const destToken = await getTokens(destChainId);

        console.log(`--- ${label} ---`);

        const body = {
            user: userAddress,
            originChainId: originChainId,
            destinationChainId: destChainId,
            originCurrency: originToken.address,
            destinationCurrency: destToken.address,
            amount: "1000000",
            tradeType: 'EXACT_INPUT'
        };

        if (recipientAddress) {
            body.recipient = recipientAddress;
        }

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
    // 1. Solana -> BNB, User=SOL
    await testQuote(SOLANA_CHAIN_ID, BNB_CHAIN_ID, SOL_ADDRESS, null, "Solana -> BNB (User: SOL)");

    // 2. Solana -> BNB, User=EVM
    await testQuote(SOLANA_CHAIN_ID, BNB_CHAIN_ID, EVM_ADDRESS, null, "Solana -> BNB (User: EVM)");

    // 3. Solana -> BNB, User=SOL, Recipient=EVM
    await testQuote(SOLANA_CHAIN_ID, BNB_CHAIN_ID, SOL_ADDRESS, EVM_ADDRESS, "Solana -> BNB (User: SOL, Recipient: EVM)");
}

runTests();
