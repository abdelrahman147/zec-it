'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Buffer } from 'buffer';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ArrowDown, Wallet, X, ChevronDown, ExternalLink, Copy, QrCode, RefreshCw, ArrowRight, ArrowRightLeft, Check, Loader2, LogOut, ArrowLeft, Info, Bell, Settings, Edit } from 'lucide-react';
import { getExchangeQuote, createExchangeTrade, getExchangeStatus } from '@/app/actions/simpleswap';
import { getCryptoPrices } from '@/app/actions/cmc';
import TransactionModal from './TransactionModal';
import TokenSelectorModal from './TokenSelectorModal';

import UniswapStyleWalletModal from './UniswapStyleWalletModal';
import { useZcashSnap } from '@/hooks/useZcashSnap';
import QRCode from 'react-qr-code';
import { getRelayChains, getRelayCurrencies, getRelayQuote, getRelayUserBalance, RelayChain, RelayCurrency } from '@/app/actions/relay';
import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect, useSendTransaction, usePublicClient, useSwitchChain, useChainId } from 'wagmi';
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { formatUnits, parseAbi } from 'viem';

const SwapView = () => {
    const { connected, publicKey, select, sendTransaction: sendSolanaTransaction } = useWallet();
    const { connection } = useConnection();

    // EVM Hooks
    const { address: evmAddress, isConnected: isEvmConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const { openAccountModal } = useAccountModal();
    const { disconnect: disconnectWagmi } = useDisconnect();
    const { sendTransactionAsync: sendEvmTransaction } = useSendTransaction();
    const { switchChainAsync } = useSwitchChain();
    const chainId = useChainId();
    const publicClient = usePublicClient();

    const [chains, setChains] = useState<RelayChain[]>([]);
    const [originChain, setOriginChain] = useState<RelayChain | null>(null);
    const [destChain, setDestChain] = useState<RelayChain | null>(null);
    const [originToken, setOriginToken] = useState<RelayCurrency | null>(null);
    const [destToken, setDestToken] = useState<RelayCurrency | null>(null);
    const [amount, setAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [useManualAddress, setUseManualAddress] = useState(false);
    const [quote, setQuote] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [tokens, setTokens] = useState<{ [chainId: number]: RelayCurrency[] }>({});

    const [originBalance, setOriginBalance] = useState<string>('0');
    const [destBalance, setDestBalance] = useState<string>('0');

    // Transaction Modal State
    const [txModalOpen, setTxModalOpen] = useState(false);
    const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [txStep, setTxStep] = useState<'signing' | 'confirming'>('signing');
    const [txHash, setTxHash] = useState<string | undefined>(undefined);
    const [txError, setTxError] = useState<string | undefined>(undefined);
    const [txDetails, setTxDetails] = useState({
        sent: { symbol: '', amount: '', logoURI: '' },
        received: { symbol: '', amount: '', logoURI: '' }
    });



    // ... (keep modal state and trending)

    // Balance Fetching Logic
    useEffect(() => {
        const fetchBalances = async () => {
            // Origin Balance
            if (originChain && originToken) {
                let userAddr = '';
                const isOriginSVM = originChain.id === 792703809 || originChain.id === 9286185;

                if (isOriginSVM && connected && publicKey) {
                    userAddr = publicKey.toBase58();
                } else if (!isOriginSVM && isEvmConnected && evmAddress) {
                    userAddr = evmAddress;
                }

                if (userAddr) {
                    try {
                        // 1. Try Relay first
                        const bal = await getRelayUserBalance(originChain.id, originToken.address, userAddr);
                        if (bal !== '0') {
                            setOriginBalance(formatUnits(BigInt(bal), originToken.decimals));
                        } else {
                            // 2. Fallback to direct chain fetch if Relay returns 0
                            if (isOriginSVM) {
                                // Solana Fallback
                                if (originToken.address === '11111111111111111111111111111111') {
                                    const balance = await connection.getBalance(new PublicKey(userAddr));
                                    setOriginBalance((balance / LAMPORTS_PER_SOL).toString());
                                } else {
                                    const mintPubkey = new PublicKey(originToken.address);
                                    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(userAddr), { mint: mintPubkey });
                                    if (tokenAccounts.value.length > 0) {
                                        const amount = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmountString;
                                        setOriginBalance(amount || '0');
                                    } else {
                                        setOriginBalance('0');
                                    }
                                }
                            } else {
                                // EVM Fallback
                                if (publicClient) {
                                    if (originToken.address === '0x0000000000000000000000000000000000000000') {
                                        const balance = await publicClient.getBalance({ address: userAddr as `0x${string}` });
                                        setOriginBalance(formatUnits(balance, originToken.decimals));
                                    } else {
                                        const balance = await publicClient.readContract({
                                            address: originToken.address as `0x${string}`,
                                            abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
                                            functionName: 'balanceOf',
                                            args: [userAddr as `0x${string}`]
                                        });
                                        setOriginBalance(formatUnits(balance as bigint, originToken.decimals));
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.error('Error fetching origin balance:', e);
                        setOriginBalance('0');
                    }
                } else {
                    setOriginBalance('0');
                }
            }

            // Destination Balance
            if (destChain && destToken) {
                let userAddr = '';
                const isDestSVM = destChain.id === 792703809 || destChain.id === 9286185;

                if (isDestSVM && connected && publicKey) {
                    userAddr = publicKey.toBase58();
                } else if (!isDestSVM && isEvmConnected && evmAddress) {
                    userAddr = evmAddress;
                }

                // Fallback to recipient address if not connected to destination chain
                if (!userAddr && recipientAddress) {
                    // Simple validation to ensure we don't use an invalid address format
                    if (isDestSVM) {
                        // Basic Solana address check (base58, length) - simplistic but helpful
                        if (recipientAddress.length > 30 && recipientAddress.length < 50) {
                            userAddr = recipientAddress;
                        }
                    } else {
                        // Basic EVM address check (starts with 0x, length 42)
                        if (recipientAddress.startsWith('0x') && recipientAddress.length === 42) {
                            userAddr = recipientAddress;
                        }
                    }
                }

                if (userAddr) {
                    try {
                        // 1. Try Relay first
                        const bal = await getRelayUserBalance(destChain.id, destToken.address, userAddr);
                        if (bal !== '0') {
                            setDestBalance(formatUnits(BigInt(bal), destToken.decimals));
                        } else {
                            // 2. Fallback to direct chain fetch
                            if (isDestSVM) {
                                // Solana Fallback
                                if (destToken.address === '11111111111111111111111111111111') {
                                    const balance = await connection.getBalance(new PublicKey(userAddr));
                                    setDestBalance((balance / LAMPORTS_PER_SOL).toString());
                                } else {
                                    const mintPubkey = new PublicKey(destToken.address);
                                    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(new PublicKey(userAddr), { mint: mintPubkey });
                                    if (tokenAccounts.value.length > 0) {
                                        const amount = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmountString;
                                        setDestBalance(amount || '0');
                                    } else {
                                        setDestBalance('0');
                                    }
                                }
                            } else {
                                // EVM Fallback
                                if (publicClient) {
                                    if (destToken.address === '0x0000000000000000000000000000000000000000') {
                                        const balance = await publicClient.getBalance({ address: userAddr as `0x${string}` });
                                        setDestBalance(formatUnits(balance, destToken.decimals));
                                    } else {
                                        const balance = await publicClient.readContract({
                                            address: destToken.address as `0x${string}`,
                                            abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
                                            functionName: 'balanceOf',
                                            args: [userAddr as `0x${string}`]
                                        });
                                        setDestBalance(formatUnits(balance as bigint, destToken.decimals));
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.error('Error fetching dest balance:', e);
                        setDestBalance('0');
                    }
                } else {
                    setDestBalance('0');
                }
            }
        };
        fetchBalances();
    }, [originChain, originToken, destChain, destToken, connected, publicKey, isEvmConnected, evmAddress]);
    // Quote Fetching Logic
    useEffect(() => {
        const fetchQuote = async () => {
            if (!originChain || !destChain || !originToken || !destToken || !amount) return;

            setLoading(true);
            setQuote(null); // Reset previous quote

            try {
                const userAddr = (originChain.id === 792703809 || originChain.id === 9286185) ? publicKey?.toBase58() : evmAddress;

                // Determine recipient
                let recipient = '';
                if (useManualAddress && recipientAddress) {
                    recipient = recipientAddress.trim();
                } else {
                    const isDestSVM = destChain.id === 792703809 || destChain.id === 9286185;
                    if (isDestSVM && publicKey) recipient = publicKey.toBase58();
                    else if (!isDestSVM && evmAddress) recipient = evmAddress;
                }

                // Fallback for quote simulation if no recipient is connected/entered
                if (!recipient) {
                    const isDestSVM = destChain.id === 792703809 || destChain.id === 9286185;
                    recipient = isDestSVM ? '11111111111111111111111111111111' : '0x0000000000000000000000000000000000000000';
                }

                console.log('Fetching quote with:', {
                    user: userAddr,
                    recipient,
                    amount,
                    origin: originChain.id,
                    dest: destChain.id
                });

                const q = await getRelayQuote({
                    user: userAddr || '0x0000000000000000000000000000000000000000',
                    originChainId: originChain.id,
                    destinationChainId: destChain.id,
                    originCurrency: originToken.address,
                    destinationCurrency: destToken.address,
                    amount: (parseFloat(amount) * Math.pow(10, originToken.decimals)).toString(),
                    tradeType: 'EXACT_INPUT',
                    recipient: recipient
                });
                setQuote(q);
            } catch (error) {
                console.error('Error fetching quote:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchQuote, 500);
        return () => clearTimeout(debounce);
    }, [originChain, destChain, originToken, destToken, amount, recipientAddress, useManualAddress, publicKey, evmAddress]);
    // Removed manual evmAddress state

    // Modal State
    const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);
    const [isDestModalOpen, setIsDestModalOpen] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [modalChainType, setModalChainType] = useState<'solana' | 'evm'>('solana');

    // Mock Trending
    const trending = [
        { symbol: 'PENGU', icon: 'https://icons.llamao.fi/icons/chains/rsz_solana?w=48&h=48' },
        { symbol: 'LGNS', icon: 'https://icons.llamao.fi/icons/chains/rsz_base?w=48&h=48' },
        { symbol: 'SAI', icon: 'https://icons.llamao.fi/icons/chains/rsz_ethereum?w=48&h=48' },
    ];

    useEffect(() => {
        const init = async () => {
            const chainList = await getRelayChains();
            setChains(chainList);
            if (chainList.length > 0) {
                setOriginChain(chainList[0]);
                setDestChain(chainList[1] || chainList[0]);
            }
        };
        init();
    }, []);

    useEffect(() => {
        const fetchTokens = async (chainId: number) => {
            // Only fetch if we have NO tokens for this chain.
            // This prevents overwriting search results if the user has already searched.
            if (!tokens[chainId] || tokens[chainId].length === 0) {
                console.log('Fetching initial tokens for chain:', chainId);
                const t = await getRelayCurrencies(chainId);
                setTokens(prev => ({ ...prev, [chainId]: t }));
                if (chainId === originChain?.id && !originToken && t.length > 0) setOriginToken(t[0]);
                if (chainId === destChain?.id && !destToken && t.length > 0) setDestToken(t[0]);
            }
        };
        if (originChain) fetchTokens(originChain.id);
        if (destChain) fetchTokens(destChain.id);
    }, [originChain, destChain]); // Removed 'tokens' from dependency to avoid loop



    const handleConnectWallet = (chainId?: number) => {
        const isSVM = chainId === 792703809 || chainId === 9286185;
        if (isSVM) {
            setModalChainType('solana');
            setIsWalletModalOpen(true);
        } else {
            if (isEvmConnected && openAccountModal) {
                openAccountModal();
            } else if (openConnectModal) {
                openConnectModal();
            }
        }
    };

    const handleTokenSearch = useCallback(async (term: string) => {
        const chainId = isOriginModalOpen ? originChain?.id : destChain?.id;
        if (!chainId) return;

        console.log('Searching tokens for:', term, 'on chain:', chainId);

        // 1. Fetch from Relay
        let results = await getRelayCurrencies(chainId, term);

        // 2. If no results or exact match not found, try to fetch on-chain metadata
        const exactMatch = results.find(t => t.address.toLowerCase() === term.toLowerCase());

        if (!exactMatch && term.length > 20) { // Simple length check for potential address
            try {
                const isSVM = chainId === 792703809 || chainId === 9286185;
                let decimals = 0;
                let symbol = 'UNKNOWN';
                let name = 'Unknown Token';
                let icon = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/generic.png';

                if (isSVM) {
                    // Solana Metadata Fetch
                    try {
                        const mintPubkey = new PublicKey(term);
                        const info = await connection.getParsedAccountInfo(mintPubkey);
                        if (info.value && 'parsed' in info.value.data) {
                            decimals = info.value.data.parsed.info.decimals;
                            symbol = 'CUSTOM';
                            name = 'Custom Token';
                        }
                    } catch (e) {
                        console.warn('Invalid Solana address or fetch failed', e);
                    }
                } else {
                    // EVM Metadata Fetch
                    try {
                        if (term.startsWith('0x') && publicClient) {
                            const [dec, sym] = await Promise.all([
                                publicClient.readContract({ address: term as `0x${string}`, abi: parseAbi(['function decimals() view returns (uint8)']), functionName: 'decimals' }),
                                publicClient.readContract({ address: term as `0x${string}`, abi: parseAbi(['function symbol() view returns (string)']), functionName: 'symbol' })
                            ]);
                            decimals = dec;
                            symbol = sym;
                        }
                    } catch (e) {
                        console.warn('Invalid EVM address or fetch failed', e);
                    }
                }

                if (decimals > 0 || symbol !== 'UNKNOWN') {
                    const customToken: RelayCurrency = {
                        address: term,
                        chainId: chainId,
                        symbol: symbol,
                        name: name,
                        decimals: decimals,
                        logoURI: icon,
                        verified: false
                    };
                    // Add to results
                    results = [customToken, ...results];
                }
            } catch (err) {
                console.error('Error fetching custom token metadata:', err);
            }
        }

        setTokens(prev => ({ ...prev, [chainId]: results }));
    }, [isOriginModalOpen, originChain, destChain, connection, publicClient]);

    const handlePercentageClick = (percentage: number) => {
        if (!originBalance) return;
        const bal = parseFloat(originBalance);
        if (isNaN(bal)) return;
        setAmount((bal * percentage).toFixed(6)); // Adjust decimals as needed
    };

    const handleSwap = async () => {
        if (!quote || !quote.steps) return;
        const isOriginSVM = originChain?.id === 792703809 || originChain?.id === 9286185;

        // 1. Check Wallet Connection
        if (isOriginSVM) {
            if (!connected) {
                setModalChainType('solana');
                setIsWalletModalOpen(true);
                return;
            }
        } else {
            if (!isEvmConnected) {
                if (openConnectModal) openConnectModal();
                return;
            }
        }

        // Initialize Modal State
        setTxStatus('pending');
        setTxStep('signing');
        setTxError(undefined);
        setTxHash(undefined);
        setTxDetails({
            sent: {
                symbol: originToken?.symbol || '',
                amount: amount,
                logoURI: originToken?.logoURI || ''
            },
            received: {
                symbol: destToken?.symbol || '',
                amount: quote.details.currencyOut.amountFormatted, // Use quote output amount
                logoURI: destToken?.logoURI || ''
            }
        });
        setTxModalOpen(true);

        console.log('Proceeding with swap execution...', quote);

        try {
            for (const step of quote.steps) {
                for (const item of step.items) {
                    if (item.status === 'complete') continue;

                    const txData = item.data;

                    // Check if it's an EVM transaction (has 'to', 'value', 'data')
                    if (txData.to && txData.data) {
                        if (isOriginSVM) {
                            console.warn('Skipping EVM transaction step because origin is Solana');
                            continue;
                        }

                        console.log('Executing EVM Transaction:', txData);

                        const txChainId = txData.chainId || originChain?.id;

                        // Switch chain if necessary
                        if (chainId !== txChainId) {
                            try {
                                await switchChainAsync({ chainId: txChainId });
                            } catch (switchError) {
                                console.error('Failed to switch chain:', switchError);
                                throw new Error('Failed to switch chain');
                            }
                        }

                        const hash = await sendEvmTransaction({
                            to: txData.to as `0x${string}`,
                            data: txData.data as `0x${string}`,
                            value: BigInt(txData.value || 0),
                            chainId: txChainId
                        });
                        console.log('EVM Transaction Sent:', hash);
                        setTxStep('confirming');
                        setTxHash(hash);

                        // Wait for confirmation to ensure sequential execution
                        if (publicClient) {
                            await publicClient.waitForTransactionReceipt({ hash });
                        }
                    }
                    // Check if it's a Solana transaction (has 'instructions')
                    else if (txData.instructions) {
                        if (!isOriginSVM) {
                            console.warn('Skipping Solana transaction step because origin is EVM');
                            continue;
                        }

                        console.log('Executing Solana Transaction:', txData);
                        const transaction = new Transaction();

                        for (const inst of txData.instructions) {
                            transaction.add(new TransactionInstruction({
                                keys: inst.keys.map((k: any) => ({
                                    pubkey: new PublicKey(k.pubkey),
                                    isSigner: k.isSigner,
                                    isWritable: k.isWritable
                                })),
                                programId: new PublicKey(inst.programId),
                                data: Buffer.from(inst.data, 'hex') // Use Buffer for hex string
                            }));
                        }

                        // Add recent blockhash
                        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
                        transaction.recentBlockhash = blockhash;
                        transaction.feePayer = publicKey!;

                        const signature = await sendSolanaTransaction(transaction, connection);
                        console.log('Solana Transaction Sent:', signature);
                        setTxStep('confirming');
                        setTxHash(signature);

                        // Robust confirmation strategy
                        try {
                            const confirmation = await connection.confirmTransaction({
                                signature,
                                blockhash,
                                lastValidBlockHeight
                            }, 'confirmed');

                            if (confirmation.value.err) {
                                throw new Error('Transaction failed: ' + confirmation.value.err.toString());
                            }
                        } catch (confirmError) {
                            console.warn('Standard confirmation failed, polling signature status...', confirmError);
                            // Fallback polling
                            let confirmed = false;
                            for (let i = 0; i < 30; i++) { // Poll for 30 seconds
                                const status = await connection.getSignatureStatus(signature);
                                if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
                                    if (status.value.err) throw new Error('Transaction failed: ' + status.value.err.toString());
                                    confirmed = true;
                                    break;
                                }
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            }
                            if (!confirmed) {
                                throw new Error('Transaction confirmation timed out. Check explorer.');
                            }
                        }
                    }
                }
            }
            setTxStatus('success');
        } catch (error: any) {
            console.error('Swap Execution Failed:', error);
            setTxStatus('error');
            setTxError(error.message || 'Swap failed');
        }
    };

    const formatAddress = (addr: string) => {
        return addr.slice(0, 4) + '...' + addr.slice(-4);
    };

    const getWalletDisplay = (chainId?: number) => {
        const isSVM = chainId === 792703809 || chainId === 9286185;
        if (isSVM) {
            return connected && publicKey ? formatAddress(publicKey.toBase58()) : 'Select wallet';
        } else {
            return evmAddress ? formatAddress(evmAddress) : 'Select wallet';
        }
    };

    const handleSwapDirection = () => {
        // Swap Chains
        const tempChain = originChain;
        setOriginChain(destChain);
        setDestChain(tempChain);

        // Swap Tokens
        const tempToken = originToken;
        setOriginToken(destToken);
        setDestToken(tempToken);

        // Reset quote and loading
        setQuote(null);
        setLoading(false);

        // Optionally swap balances if needed for display immediately, 
        // but the useEffect will likely re-fetch them.
        // We can just let the useEffect handle it.
    };

    return (
        <div className="max-w-[480px] mx-auto p-4">
            {/* Trending Bar */}
            <div className="flex items-center justify-center gap-2 mb-6">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-[#141414] px-3 py-1.5 rounded-full border border-white/5">
                    <span className="text-purple-400">🔥 Trending</span>
                    {trending.map((t, i) => (
                        <div key={i} className="flex items-center gap-1 ml-2 hover:bg-white/5 px-2 py-0.5 rounded cursor-pointer transition-colors">
                            <img src={t.icon} className="w-4 h-4 rounded-full" />
                            <span className="text-white">{t.symbol}</span>
                        </div>
                    ))}
                    <ChevronDown size={12} className="ml-1" />
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-2 shadow-2xl">
                {/* Header Tabs */}
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-1">
                        <button className="px-3 py-1.5 bg-white/5 rounded-lg text-white font-medium text-sm">Swap</button>
                    </div>
                    <Settings size={18} className="text-gray-500 hover:text-white cursor-pointer" />
                </div>

                {/* Sell Card */}
                <div className="bg-[#141414] rounded-2xl p-4 mb-1 border border-white/5 hover:border-white/10 transition-colors group">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 text-xs font-medium">Sell</span>
                        <button
                            onClick={() => handleConnectWallet(originChain?.id)}
                            className="text-indigo-400 text-xs font-medium hover:text-indigo-300 flex items-center gap-1"
                        >
                            {getWalletDisplay(originChain?.id)} <ChevronDown size={12} />
                        </button>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-transparent text-4xl font-bold text-white outline-none placeholder-gray-700 font-mono"
                            placeholder="0"
                        />
                        <button
                            onClick={() => setIsOriginModalOpen(true)}
                            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-white/10 rounded-full pl-2 pr-4 py-1.5 cursor-pointer transition-all shrink-0"
                        >
                            {originToken?.logoURI ? (
                                <img src={originToken.logoURI} alt={originToken.symbol} className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-black">
                                    {originToken?.symbol?.[0] || '?'}
                                </div>
                            )}
                            <div className="flex flex-col items-start">
                                <span className="text-base font-bold text-white leading-none">{originToken?.symbol || 'Select'}</span>
                                <span className="text-[10px] text-gray-500 leading-none mt-0.5">{originChain?.displayName || 'Chain'}</span>
                            </div>
                            <ChevronDown size={16} className="text-gray-500 ml-1" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-500">$0.00</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Balance: {parseFloat(originBalance).toFixed(4)} {originToken?.symbol}</span>
                            <div className="flex gap-1">
                                <button onClick={() => handlePercentageClick(0.2)} className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 px-1.5 py-0.5 rounded transition-colors">20%</button>
                                <button onClick={() => handlePercentageClick(0.5)} className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 px-1.5 py-0.5 rounded transition-colors">50%</button>
                                <button onClick={() => handlePercentageClick(1)} className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 px-1.5 py-0.5 rounded transition-colors">MAX</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Switcher Arrow */}
                <div className="flex justify-center -my-5 relative z-10">
                    <div className="bg-[#141414] p-1.5 rounded-xl border border-white/5 shadow-lg">
                        <div
                            className="bg-[#1a1a1a] p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer transition-colors"
                            onClick={handleSwapDirection}
                        >
                            <ArrowDown size={16} />
                        </div>
                    </div>
                </div>

                {/* Buy Card */}
                <div className="bg-[#141414] rounded-2xl p-4 mt-1 border border-white/5 hover:border-white/10 transition-colors group">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 text-xs font-medium">Buy</span>
                        <div className="flex items-center gap-2">
                            {/* Toggle Manual/Wallet */}
                            <button
                                onClick={() => setUseManualAddress(!useManualAddress)}
                                className="flex items-center gap-2 text-xs font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-indigo-200 px-3 py-1.5 rounded-lg transition-all border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                            >
                                {useManualAddress ? <Wallet size={14} /> : <Edit size={14} />}
                                {useManualAddress ? 'Connect Wallet' : 'Manual Address'}
                            </button>

                            {useManualAddress ? (
                                <input
                                    type="text"
                                    value={recipientAddress}
                                    onChange={(e) => setRecipientAddress(e.target.value)}
                                    placeholder={destChain?.id === 792703809 || destChain?.id === 9286185 ? "Solana Address..." : "0x..."}
                                    className={`bg-[#1a1a1a] border ${recipientAddress && ((destChain?.id === 792703809 || destChain?.id === 9286185)
                                        ? (recipientAddress.length < 32 || recipientAddress.length > 44)
                                        : !recipientAddress.startsWith('0x') || recipientAddress.length !== 42)
                                        ? 'border-red-500/50 focus:border-red-500'
                                        : 'border-white/10 focus:border-indigo-500'
                                        } rounded-lg px-3 py-1.5 text-xs text-white w-40 focus:outline-none font-mono transition-colors`}
                                />
                            ) : (
                                <button
                                    onClick={() => handleConnectWallet(destChain?.id)}
                                    className="text-indigo-400 text-xs font-medium hover:text-indigo-300 flex items-center gap-1"
                                >
                                    {getWalletDisplay(destChain?.id)} <ChevronDown size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <div className="text-4xl font-bold text-gray-500 font-mono">
                            {quote && !('error' in quote) ? (Number(quote.details?.currencyOut?.amount) / Math.pow(10, destToken?.decimals || 18)).toFixed(4) : '0'}
                        </div>
                        <button
                            onClick={() => setIsDestModalOpen(true)}
                            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-white/10 rounded-full pl-2 pr-4 py-1.5 cursor-pointer transition-all shrink-0"
                        >
                            {destToken?.logoURI ? (
                                <img src={destToken.logoURI} alt={destToken.symbol} className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                                    {destToken?.symbol?.[0] || '?'}
                                </div>
                            )}
                            <div className="flex flex-col items-start">
                                <span className="text-base font-bold text-white leading-none">{destToken?.symbol || 'Select'}</span>
                                <span className="text-[10px] text-gray-500 leading-none mt-0.5">{destChain?.displayName || 'Chain'}</span>
                            </div>
                            <ChevronDown size={16} className="text-gray-500 ml-1" />
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-500">$0.00</span>
                        <span className="text-xs text-gray-500">Balance: {parseFloat(destBalance).toFixed(4)} {destToken?.symbol}</span>
                    </div>
                </div>

                {/* Main Action Button */}
                <button
                    onClick={handleSwap}
                    disabled={loading}
                    className="w-full mt-2 py-4 bg-[#4F46E5] hover:bg-[#4338ca] text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 text-lg"
                >
                    {loading ? 'Fetching Quote...' :
                        (originChain?.id === 792703809 || originChain?.id === 9286185) && !connected ? 'Connect Solana Wallet' :
                            (originChain?.id !== 792703809 && originChain?.id !== 9286185) && !evmAddress ? 'Connect EVM Wallet' :
                                `Swap ${originToken?.symbol || ''} to ${destToken?.symbol || ''}`}
                </button>

                {quote && 'error' in quote && (
                    <div className="text-red-500 text-center text-xs mt-2 bg-red-500/10 py-2 rounded-lg border border-red-500/20">{quote.error}</div>
                )}

                {/* Modals */}
                {/* Origin Token Modal */}
                <TokenSelectorModal
                    isOpen={isOriginModalOpen}
                    onClose={() => setIsOriginModalOpen(false)}
                    chains={chains}
                    tokens={tokens[originChain?.id || 0] || []}
                    selectedChain={originChain}
                    onSelectChain={setOriginChain}
                    onSelectToken={(t) => {
                        setOriginToken(t);
                        setIsOriginModalOpen(false);
                    }}
                    onSearch={handleTokenSearch}
                />

                {/* Destination Token Modal */}
                <TokenSelectorModal
                    isOpen={isDestModalOpen}
                    onClose={() => setIsDestModalOpen(false)}
                    chains={chains}
                    tokens={tokens[destChain?.id || 0] || []}
                    selectedChain={destChain}
                    onSelectChain={setDestChain}
                    onSelectToken={(t) => {
                        setDestToken(t);
                        setIsDestModalOpen(false);
                    }}
                    onSearch={handleTokenSearch}
                />

                <UniswapStyleWalletModal
                    isOpen={isWalletModalOpen}
                    onClose={() => setIsWalletModalOpen(false)}
                    chainType={modalChainType}
                    evmAddress={evmAddress || null}
                    onConnectEvm={() => { }}
                    onDisconnectEvm={() => { }}
                />
                <TransactionModal
                    isOpen={txModalOpen}
                    onClose={() => setTxModalOpen(false)}
                    status={txStatus}
                    step={txStep}
                    sentToken={txDetails.sent}
                    receivedToken={txDetails.received}
                    txHash={txHash}
                    error={txError}
                    chainId={destChain?.id}
                />
            </div>
        </div>
    );
};

interface BridgeInterfaceProps {
    onBack: () => void;
}

// --- THE REAL BRIDGE INTERFACE ---
const BridgeInterface: React.FC<BridgeInterfaceProps> = ({ onBack }) => {
    const { connected, publicKey, connect, disconnect, select, wallets, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [activeTab, setActiveTab] = useState('Mixer');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [amount, setAmount] = useState(''); // Unified amount state
    const [quoteAmount, setQuoteAmount] = useState<string>('--'); // Unified quote state
    const [recipientAddress, setRecipientAddress] = useState(''); // Manual recipient address
    const [direction, setDirection] = useState<'ZEC_TO_SOL' | 'SOL_TO_ZEC'>('ZEC_TO_SOL');
    const [selectedSolToken, setSelectedSolToken] = useState('sol'); // 'sol', 'usdc', etc.
    const [trade, setTrade] = useState<any>(null);
    const [tradeStatus, setTradeStatus] = useState<string>('');
    const [modalOpen, setModalOpen] = useState(false);
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [prices, setPrices] = useState<{ zec: number; sol: number } | null>(null);
    const { isInstalled: zecInstalled, address: zecAddress, connect: connectZec, sendTransaction: sendZec, snapSupported, error: zecError, isLoading: zecLoading } = useZcashSnap();

    // Handle Zcash Errors
    useEffect(() => {
        if (zecError) {
            alert(`Zcash Connection Error: ${zecError}`);
        }
    }, [zecError]);

    // Fetch crypto prices
    useEffect(() => {
        const fetchPrices = async () => {
            const priceData = await getCryptoPrices();
            if (priceData) {
                setPrices(priceData);
            }
        };
        fetchPrices();
        const intervalId = setInterval(fetchPrices, 60000); // Update every 60 seconds
        return () => clearInterval(intervalId);
    }, []);

    // Fetch SOL Balance
    // Fetch SOL Balance - REMOVED since we are manual now
    // useEffect(() => {
    //     if (connected && publicKey) {
    //         connection.getBalance(publicKey).then(balance => {
    //             setSolBalance(balance / LAMPORTS_PER_SOL);
    //         }).catch(e => console.error("Failed to fetch balance", e));
    //     } else {
    //         setSolBalance(null);
    //     }
    // }, [connected, publicKey, connection]);

    const [quoteError, setQuoteError] = useState<string | null>(null);

    // Debounce quote fetching
    useEffect(() => {
        const fetchQuote = async () => {
            setQuoteError(null);
            if (!amount || isNaN(parseFloat(amount))) {
                setQuoteAmount('--');
                return;
            }
            const inputAmount = parseFloat(amount);
            if (inputAmount > 0) {
                const from = direction === 'ZEC_TO_SOL' ? 'zec' : selectedSolToken;
                const to = direction === 'ZEC_TO_SOL' ? selectedSolToken : 'zec';

                const result = await getExchangeQuote(inputAmount, from, to);
                if (result && result.value !== undefined) {
                    setQuoteAmount(result.value.toFixed(4));
                } else if (result && result.error) {
                    setQuoteAmount('--');
                    setQuoteError(result.error);
                } else {
                    setQuoteAmount('--');
                }
            }
        };

        const timeoutId = setTimeout(fetchQuote, 500);
        return () => clearTimeout(timeoutId);
    }, [amount, direction, selectedSolToken]);

    // Poll trade status
    useEffect(() => {
        if (!trade || tradeStatus === 'finished') return;

        const pollStatus = async () => {
            const status = await getExchangeStatus(trade.id);
            if (status) {
                setTradeStatus(status);
                if (status === 'finished') {
                    setSuccess(true);
                    setLoading(false);
                }
            }
        };

        const intervalId = setInterval(pollStatus, 10000); // Poll every 10s
        return () => clearInterval(intervalId);
    }, [trade, tradeStatus]);

    const handleBridge = async () => {
        // Validation: Ensure amount and recipient address are present
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!recipientAddress) {
            alert('Please enter a recipient address');
            return;
        }

        setLoading(true);

        try {
            const from = direction === 'ZEC_TO_SOL' ? 'zec' : selectedSolToken;
            const to = direction === 'ZEC_TO_SOL' ? selectedSolToken : 'zec';

            // Use manual recipient address
            const recipient = recipientAddress;

            const tradeData = await createExchangeTrade(parseFloat(amount), recipient, from, to);

            if (!tradeData) {
                alert('Failed to create trade. Please check your API key and try again.');
                return;
            }

            if ('error' in tradeData) {
                alert(`Trade Error: ${tradeData.error}`);
                return;
            }

            setTrade(tradeData);
            setTradeStatus('waiting');

            // We are not auto-sending transactions anymore.
            // The user will manually send funds to the deposit address.
            setTradeStatus('waiting');

            // Start polling for status
            const pollInterval = setInterval(async () => {
                const status = await getExchangeStatus(tradeData.id);
                if (status) {
                    setTradeStatus(status);
                    if (status === 'finished' || status === 'failed') {
                        clearInterval(pollInterval);
                        if (status === 'finished') {
                            setSuccess(true);
                        }
                    }
                }
            }, 10000);
        } catch (error) {
            console.error("Bridge error:", error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDirection = () => {
        setDirection(prev => prev === 'ZEC_TO_SOL' ? 'SOL_TO_ZEC' : 'ZEC_TO_SOL');
        // Swap amounts logic if needed, or just clear
        setAmount('');
        setQuoteAmount('--');
    };

    // Main Content Component Switcher
    const renderContent = () => {
        switch (activeTab) {
            case 'Swap': return <SwapView />;
            case 'Mixer':
            default:
                // If trade is active, show the Status View (SimpleSwap style)
                if (trade) {
                    return (
                        <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-6">
                            {/* Status Header */}
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-white">
                                    {tradeStatus === 'waiting' ? 'Awaiting your deposit' :
                                        tradeStatus === 'confirming' ? 'Confirming' :
                                            tradeStatus === 'exchanging' ? 'Exchanging' :
                                                tradeStatus === 'sending' ? 'Sending' : 'Finished'}
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    {tradeStatus === 'waiting' ? 'Send the funds to the address below' :
                                        tradeStatus === 'exchanging' ? 'Your coins are safe and being exchanged' :
                                            tradeStatus === 'sending' ? 'Coins are on the way' :
                                                'Exchange completed successfully'}
                                </p>
                            </div>

                            {/* Main Status Card */}
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                                {/* Deposit Section (Only when waiting) */}
                                {tradeStatus === 'waiting' && (
                                    <div className="p-8 border-b border-white/5 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Send deposit:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-bold text-white">{trade.inAmount} {trade.inCurrency.toUpperCase()}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded ${trade.inCurrency === 'zec' ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-500'}`}>
                                                    {trade.inCurrency.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-[#141414] rounded-xl p-6 flex flex-col items-center gap-6">
                                            <div className="bg-white p-3 rounded-xl">
                                                {/* QR Code */}
                                                <QRCode
                                                    value={trade.inAddress}
                                                    size={160}
                                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                    viewBox={`0 0 256 256`}
                                                />
                                            </div>
                                            <div className="w-full">
                                                <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 px-4 py-3 rounded-xl w-full">
                                                    <span className="text-sm font-mono text-white truncate flex-1">{trade.inAddress}</span>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(trade.inAddress)}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                    >
                                                        <Copy size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                                            <Info className="text-blue-400 shrink-0" size={20} />
                                            <p className="text-sm text-blue-200/80">
                                                If you sent the coins and the status did not change immediately, do not worry. Our system needs a few minutes to detect the transaction.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Progress Stepper */}
                                <div className="p-8 border-b border-white/5">
                                    <div className="relative flex justify-between items-center px-4">
                                        {/* Line Background */}
                                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/5 -z-10 mx-8"></div>
                                        {[
                                            { id: 'waiting', label: 'Pending deposit' },
                                            { id: 'confirming', label: 'Confirming' },
                                            { id: 'exchanging', label: 'Exchanging' },
                                            { id: 'sending', label: 'Sending' }
                                        ].map((step) => {
                                            const isActive = tradeStatus === step.id;
                                            const stepIndex = ['waiting', 'confirming', 'exchanging', 'sending'].indexOf(step.id);
                                            const currentIndex = ['waiting', 'confirming', 'exchanging', 'sending', 'finished'].indexOf(tradeStatus);
                                            const isCompleted = currentIndex > stepIndex || tradeStatus === 'finished';

                                            return (
                                                <div key={step.id} className="flex flex-col items-center gap-3 bg-[#0a0a0a] px-2 z-10">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isActive || isCompleted ? 'border-green-500 bg-green-500 text-black' : 'border-gray-700 bg-[#141414] text-gray-500'
                                                        }`}>
                                                        {isCompleted ? <Check size={14} strokeWidth={3} /> :
                                                            isActive ? <Loader2 size={14} className="animate-spin" /> :
                                                                <div className="w-2 h-2 rounded-full bg-current" />}
                                                    </div>
                                                    <span className={`text-xs font-medium ${isActive || isCompleted ? 'text-green-500' : 'text-gray-600'}`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Operation Details */}
                                <div className="p-8 space-y-4">
                                    <h3 className="text-sm font-medium text-white mb-4">Operation details</h3>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">You sent:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono">{trade.inAmount} {trade.inCurrency.toUpperCase()}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${trade.inCurrency === 'zec' ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-500'}`}>
                                                {trade.inCurrency.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Deposit address:</span>
                                        <div className="flex items-center gap-2 bg-[#141414] px-3 py-1.5 rounded-lg max-w-[200px] md:max-w-xs">
                                            <span className="text-xs text-gray-400 truncate">{trade.inAddress}</span>
                                            <Copy size={12} className="text-gray-500 cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(trade.inAddress)} />
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/5 my-2"></div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">You get:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono">≈ {trade.outAmount} {trade.outCurrency.toUpperCase()}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${trade.outCurrency === 'zec' ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-500'}`}>
                                                {trade.outCurrency.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Recipient address:</span>
                                        <div className="flex items-center gap-2 bg-[#141414] px-3 py-1.5 rounded-lg max-w-[200px] md:max-w-xs">
                                            <span className="text-xs text-gray-400 truncate">{recipientAddress}</span>
                                            <Copy size={12} className="text-gray-500 cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(recipientAddress)} />
                                        </div>
                                    </div>
                                </div>

                                {tradeStatus === 'finished' && (
                                    <div className="p-8 pt-0">
                                        <button
                                            onClick={() => { setTrade(null); setAmount(''); setRecipientAddress(''); }}
                                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
                                        >
                                            Create new exchange
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                // Default Input View (SimpleSwap style)
                return (
                    <div className="max-w-3xl mx-auto p-4 lg:p-8 flex flex-col gap-6">
                        <div className="text-center mb-4">
                            <h2 className="text-3xl font-bold text-white mb-2">Solana Mixer</h2>
                            <p className="text-gray-400">Bridge from SOL to ZEC and back from ZEC to SOL to completely clean your SOL</p>
                        </div>

                        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 shadow-2xl">
                            <div className="bg-[#141414] rounded-[20px] p-6 lg:p-8 space-y-6">
                                {/* You Send */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">You send</span>
                                        <span className="text-gray-500">
                                            {direction === 'ZEC_TO_SOL' ? 'Zcash Network' : 'Solana Network'}
                                        </span>
                                    </div>
                                    <div className="flex gap-4">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="flex-1 bg-transparent text-3xl font-bold text-white outline-none placeholder-gray-700 font-mono"
                                            placeholder="0.1"
                                        />
                                        <div className="flex items-center gap-2 bg-[#0a0a0a] px-4 py-2 rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-colors" onClick={toggleDirection}>
                                            {direction === 'ZEC_TO_SOL' ? (
                                                <>
                                                    <img src="https://static.simpleswap.io/images/currencies-logo/zec.svg" className="w-6 h-6 rounded-full" />
                                                    <span className="font-bold text-white">ZEC</span>
                                                </>
                                            ) : (
                                                <>
                                                    <img src="https://static.simpleswap.io/images/currencies-logo/sol.svg" className="w-6 h-6 rounded-full" />
                                                    <span className="font-bold text-white">SOL</span>
                                                </>
                                            )}
                                            <ChevronDown size={16} className="text-gray-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Divider / Switcher */}
                                <div className="relative h-px bg-white/5 my-4">
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#141414] p-2 rounded-full border border-white/5 cursor-pointer hover:text-orange-500 transition-colors" onClick={toggleDirection}>
                                        <ArrowRightLeft size={16} className="text-gray-500 rotate-90" />
                                    </div>
                                </div>

                                {/* You Get */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">You get</span>
                                        <span className="text-gray-500">
                                            {direction === 'ZEC_TO_SOL' ? 'Solana Network' : 'Zcash Network'}
                                        </span>
                                    </div>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            readOnly
                                            value={quoteAmount === '--' ? '≈ 0.00' : `≈ ${quoteAmount}`}
                                            className="flex-1 bg-transparent text-3xl font-bold text-gray-400 outline-none font-mono"
                                        />
                                        <div className="flex items-center gap-2 bg-[#0a0a0a] px-4 py-2 rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-colors" onClick={toggleDirection}>
                                            {direction === 'ZEC_TO_SOL' ? (
                                                <>
                                                    <img src="https://static.simpleswap.io/images/currencies-logo/sol.svg" className="w-6 h-6 rounded-full" />
                                                    <span className="font-bold text-white">SOL</span>
                                                </>
                                            ) : (
                                                <>
                                                    <img src="https://static.simpleswap.io/images/currencies-logo/zec.svg" className="w-6 h-6 rounded-full" />
                                                    <span className="font-bold text-white">ZEC</span>
                                                </>
                                            )}
                                            <ChevronDown size={16} className="text-gray-500" />
                                        </div>
                                    </div>
                                    {quoteError && (
                                        <p className="text-red-500 text-xs mt-2">{quoteError}</p>
                                    )}
                                </div>
                            </div>

                            {/* Recipient Address Section */}
                            <div className="p-6 lg:p-8 pt-0">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 ml-1">
                                        {direction === 'ZEC_TO_SOL' ? "The recipient's Solana address" : "The recipient's Zcash address"}
                                    </label>
                                    <div className="bg-[#141414] rounded-xl flex items-center px-4 py-3 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                                        <input
                                            type="text"
                                            value={recipientAddress}
                                            onChange={(e) => setRecipientAddress(e.target.value)}
                                            className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none font-mono text-sm"
                                            placeholder={direction === 'ZEC_TO_SOL' ? "Enter Solana address" : "Enter Zcash address"}
                                        />
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <QrCode size={20} className="hover:text-white cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBridge}
                                    disabled={loading || !amount || parseFloat(amount) <= 0 || !recipientAddress}
                                    className="w-full mt-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>Creating Exchange...</span>
                                        </>
                                    ) : (
                                        'Create an exchange'
                                    )}
                                </button>

                                <div className="flex justify-center gap-4 mt-6 text-xs text-gray-600">
                                    <a href="#" className="hover:text-gray-400">Privacy Policy</a>
                                    <span>•</span>
                                    <a href="#" className="hover:text-gray-400">Terms of Service</a>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black overflow-hidden">
            {/* Sidebar Navigation - Desktop/Tablet */}
            <div className="hidden md:flex w-20 lg:w-64 bg-[#0a0a0a] border-r border-white/5 flex-col justify-between py-6">
                <div>
                    <div className="flex items-center gap-3 px-6 mb-10 cursor-pointer" onClick={onBack}>
                        <ArrowLeft className="text-gray-400 hover:text-white transition-colors" size={24} />
                        <span className="text-lg font-bold text-white hidden lg:block">Back</span>
                    </div>

                    <div className="space-y-2 px-3">
                        {[
                            { id: 'Mixer', icon: Wallet, label: 'Mixer' },
                            { id: 'Swap', icon: ArrowRightLeft, label: 'Swap' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                    ? 'bg-orange-500/10 text-orange-500'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium hidden lg:block">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-teal-400"></div>
                        <div className="hidden lg:block">
                            <p className="text-xs text-gray-400">{connected ? 'Connected' : 'Not Connected'}</p>
                            <p className="text-sm font-mono text-white">{connected && publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : '--'}</p>
                        </div>
                        {connected && (
                            <button
                                onClick={disconnect}
                                className="ml-auto p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Disconnect Wallet"
                            >
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Top Bar */}
            <div className="md:hidden h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 z-20 shrink-0">
                <div className="flex items-center gap-3" onClick={onBack}>
                    <ArrowLeft className="text-gray-400" size={20} />
                    <span className="font-bold text-white text-lg">{activeTab}</span>
                </div>
                <div className="flex items-center gap-3">
                    {/* Mobile Wallet Indicator */}
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <Bell size={20} className="text-gray-400" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-black relative overflow-hidden">
                <div className="hidden md:flex h-16 border-b border-white/5 items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md z-10 shrink-0">
                    <h2 className="text-xl font-bold text-white">{activeTab}</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-green-500 font-medium">Mainnet Active</span>
                        </div>
                        <Bell size={20} className="text-gray-400 hover:text-white cursor-pointer" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto relative pb-20 md:pb-0">
                    {renderContent()}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/5 z-50 flex justify-around p-4 pb-6 safe-area-bottom">
                {[
                    { id: 'Mixer', icon: Wallet, label: 'Mixer' },
                    { id: 'Swap', icon: ArrowRightLeft, label: 'Swap' },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center gap-1 ${activeTab === item.id
                            ? 'text-orange-500'
                            : 'text-gray-500'
                            }`}
                    >
                        <item.icon size={24} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                ))}
            </div>


        </div>
    );
};

export default BridgeInterface;
