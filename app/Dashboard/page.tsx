'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const BridgeInterface = dynamic(() => import('@/components/BridgeInterface'), {
    ssr: false,
    loading: () => <div className="min-h-screen flex items-center justify-center text-white">Loading Interface...</div>
});

export default function DashboardPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            <BridgeInterface onBack={() => router.push('/')} />
        </div>
    );
}
