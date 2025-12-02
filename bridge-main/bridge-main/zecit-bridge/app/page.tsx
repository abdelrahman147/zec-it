'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import SolanaSection from '@/components/SolanaSection';
import ArchitectureSection from '@/components/ArchitectureSection';
import FeaturesSection from '@/components/FeaturesSection';

import Footer from '@/components/Footer';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLaunchApp = () => {
    router.push('/Dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      <Navbar scrolled={scrolled} onLaunchApp={handleLaunchApp} />
      <HeroSection onLaunchApp={handleLaunchApp} />
      <SolanaSection />
      <ArchitectureSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
