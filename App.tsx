
import React, { useState } from 'react';
import Scene from './components/Scene';
import WaitlistForm from './components/WaitlistForm';
import FeatureCard from './components/FeatureCard';
import AdminPanel from './components/AdminPanel';
import { Clock, Network, Zap, Lock } from 'lucide-react';

const App = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full font-sans selection:bg-white selection:text-black">
      {/* 3D Background */}
      <Scene />

      {/* Admin Panel Overlay */}
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      {/* Main Content Overlay */}
      <div className="relative z-10 w-full min-h-screen flex flex-col px-6 md:px-12 py-8 overflow-y-auto">
        
        {/* Minimal Header */}
        <nav className="flex justify-between items-center w-full mb-20 md:mb-32">
          <div className="text-sm font-semibold tracking-widest uppercase text-white">
            Scedge
          </div>
        </nav>

        {/* Minimal Hero */}
        <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-16 md:gap-8 items-start">
          
          {/* Left Column: Title & Form */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-5xl md:text-7xl font-light text-white mb-8 tracking-tighter leading-[1.1]">
              Schedule at the<br />
              <span className="text-neutral-500">speed of thought.</span>
            </h1>

            <p className="text-neutral-400 font-light text-lg mb-12 max-w-md leading-relaxed">
              A sentient timeline engine that predicts bottlenecks and optimizes resources before you even notice them.
            </p>

            <div className="max-w-sm mb-16">
              <WaitlistForm />
            </div>
          </div>

          {/* Right Column: Features (Vertical list) */}
          <div className="flex-1 w-full md:pt-4">
            <div className="grid grid-cols-1 gap-8 md:pl-20 border-l border-white/5">
              <FeatureCard 
                title="Temporal Reasoning" 
                description="Dependencies understood like a human, adjusted in real-time."
                icon={<Network />}
              />
              <FeatureCard 
                title="Fluid Resourcing" 
                description="Allocation based on velocity, burnout risk, and skill scores."
                icon={<Zap />}
              />
              <FeatureCard 
                title="Contextual Sync" 
                description="Deep integration with codebase and documentation."
                icon={<Clock />}
              />
            </div>
          </div>

        </main>

        <footer className="mt-auto pt-24 text-neutral-700 text-[10px] uppercase tracking-widest flex items-center gap-6">
          <span>© 2025 Scedge Inc.</span>
          <a href="#" className="hover:text-neutral-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-neutral-400 transition-colors">Terms</a>
          
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="ml-auto opacity-20 hover:opacity-100 transition-opacity p-2"
            title="Admin Access"
          >
            <Lock className="w-3 h-3" />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;
