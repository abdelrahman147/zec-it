import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Globe, Star } from 'lucide-react';
import { RelayChain, RelayCurrency } from '@/app/actions/relay';

interface TokenSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    chains: RelayChain[];
    tokens: RelayCurrency[];
    selectedChain: RelayChain | null;
    onSelectChain: (chain: RelayChain) => void;
    onSelectToken: (token: RelayCurrency) => void;
    onSearch?: (term: string) => void;
}

const TokenSelectorModal: React.FC<TokenSelectorModalProps> = ({
    isOpen,
    onClose,
    chains,
    tokens,
    selectedChain,
    onSelectChain,
    onSelectToken,
    onSearch
}) => {
    const [tokenSearch, setTokenSearch] = useState('');
    const [chainSearch, setChainSearch] = useState('');

    // Debounced search
    useEffect(() => {
        if (!onSearch) return;

        // Only search if there is a term, or if we want to reset (empty term)
        const timer = setTimeout(() => {
            onSearch(tokenSearch);
        }, 500);
        return () => clearTimeout(timer);
    }, [tokenSearch, onSearch]);

    const filteredChains = useMemo(() => {
        return chains.filter(c => c.displayName.toLowerCase().includes(chainSearch.toLowerCase()));
    }, [chains, chainSearch]);

    const filteredTokens = useMemo(() => {
        // If we are using remote search (onSearch provided) and there is a search term,
        // we trust that the parent component has already filtered/fetched the correct tokens.
        // We shouldn't re-filter them strictly, especially if the API returns fuzzy matches.
        if (onSearch && tokenSearch.trim().length > 0) {
            return tokens;
        }

        return tokens.filter(t =>
            t.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
            t.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
            t.address.toLowerCase() === tokenSearch.toLowerCase()
        );
    }, [tokens, tokenSearch, onSearch]);

    // Popular tokens (mock logic: just take the first 6, or specific symbols if available)
    const popularTokens = useMemo(() => {
        const popularSymbols = ['ETH', 'USDC', 'USDT', 'WBTC', 'WETH', 'DAI'];
        const found = tokens.filter(t => popularSymbols.includes(t.symbol));
        // If we don't find enough popular ones, just fill with top tokens
        if (found.length < 4) return tokens.slice(0, 6);
        return found.slice(0, 6);
    }, [tokens]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-3xl flex h-[600px] shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden font-sans">

                {/* LEFT SIDEBAR: CHAINS */}
                <div className="w-1/3 border-r border-white/5 flex flex-col bg-[#0a0a0a]">
                    <div className="p-4 pb-2">
                        <h3 className="text-lg font-semibold text-white mb-4">Select Token</h3>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search chains"
                                value={chainSearch}
                                onChange={(e) => setChainSearch(e.target.value)}
                                className="w-full bg-[#141414] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                            <Globe size={16} /> All Chains
                        </button>
                        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                            <Star size={16} /> Starred Chains
                        </button>

                        <div className="my-2 border-t border-white/5 mx-2"></div>

                        {filteredChains.map(chain => (
                            <button
                                key={chain.id}
                                onClick={() => onSelectChain(chain)}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-sm font-medium ${selectedChain?.id === chain.id
                                    ? 'bg-indigo-500/10 text-indigo-400'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {chain.icon ? (
                                    <img src={chain.icon} alt={chain.name} className="w-5 h-5 rounded-full" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-[8px]">{chain.name[0].toUpperCase()}</div>
                                )}
                                {chain.displayName}
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT CONTENT: TOKENS */}
                <div className="w-2/3 flex flex-col bg-[#141414]">
                    <div className="p-4 border-b border-white/5 flex gap-4 items-center">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search for a token or paste address"
                                value={tokenSearch}
                                onChange={(e) => setTokenSearch(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {/* Popular Tokens Pills */}
                        {popularTokens.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {popularTokens.map(token => (
                                    <button
                                        key={token.address}
                                        onClick={() => { onSelectToken(token); onClose(); }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] border border-white/10 rounded-full hover:border-white/30 hover:bg-white/5 transition-colors"
                                    >
                                        {token.logoURI ? (
                                            <img src={token.logoURI} alt={token.symbol} className="w-5 h-5 rounded-full" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-indigo-500 text-[8px] flex items-center justify-center text-white">{token.symbol[0]}</div>
                                        )}
                                        <span className="text-xs font-medium text-white">{token.symbol}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="text-xs font-medium text-gray-500 mb-2">Token List</div>

                        <div className="space-y-1">
                            {filteredTokens.map(token => (
                                <button
                                    key={token.address}
                                    onClick={() => { onSelectToken(token); onClose(); }}
                                    className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        {token.logoURI ? (
                                            <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full bg-white/5" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                                {token.symbol[0]}
                                            </div>
                                        )}
                                        <div className="text-left">
                                            <div className="text-white font-medium text-sm">{token.name}</div>
                                            <div className="text-xs text-gray-500">{token.symbol}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {/* Placeholder for balance or price if available */}
                                        <div className="text-white font-medium text-sm">0</div>
                                        <div className="text-xs text-gray-500">$0.00</div>
                                    </div>
                                </button>
                            ))}
                            {filteredTokens.length === 0 && (
                                <div className="text-center text-gray-500 py-8 text-sm">
                                    {tokens.length === 0 ? 'Loading tokens...' : 'No tokens found'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokenSelectorModal;
