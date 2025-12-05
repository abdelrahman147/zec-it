'use client';

import React from 'react';
import { Shield } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                                <Shield size={16} fill="white" />
                            </div>
                            <span className="text-xl font-bold text-white">Zecit</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            The first privacy-preserving mixer connecting the robust anonymity of Zcash with the high-performance ecosystem of Solana.
                        </p>
                    </div>

                    <div>
                        <h5 className="text-white font-bold mb-4">Protocol</h5>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Governance</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Proof of Reserve</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Bug Bounty</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-white font-bold mb-4">Community</h5>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-purple-500 transition-colors">Discord</a></li>
                            <li><a href="#" className="hover:text-purple-500 transition-colors">Twitter / X</a></li>
                            <li><a href="#" className="hover:text-purple-500 transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-purple-500 transition-colors">Forum</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-white font-bold mb-4">Legal</h5>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-sm">© 2024 Zecit Protocol. All rights reserved.</p>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <div className="w-2 h-2 rounded-full bg-[#14F195]"></div>
                        <span>All Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
