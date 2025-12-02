'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BridgeInterface from '@/components/BridgeInterface';

export default function DashboardPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            <BridgeInterface onBack={() => router.push('/')} />
        </div>
    );
}
