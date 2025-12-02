'use client';

import React from 'react';

const SolanaSection = () => (
    <div className="relative w-full py-20 md:py-32 bg-[#050014] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0a0500] via-purple-900/10 to-black"></div>
        <div className="absolute top-1/2 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-teal-500/10 rounded-full blur-[60px] md:blur-[80px]" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6 md:mb-8">
                The Speed of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-teal-400">Solana</span> <br />
                The Privacy of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">Zcash</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                Our proprietary "Ghost Bridge" technology wraps your ZEC into a secure, untraceable SPL token on Solana, ensuring your financial footprint never leaves the dark forest.
            </p>
        </div>
    </div>
);

export default SolanaSection;
