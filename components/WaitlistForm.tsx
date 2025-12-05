
import React, { useState } from 'react';
import { ArrowRight, Loader2, Check } from 'lucide-react';
import { WaitlistFormProps } from '../types';
import { saveEmail } from '../services/storage';

interface Particle {
  id: number;
  tx: number;
  ty: number;
  r: number;
  delay: number;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({ className }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [particles, setParticles] = useState<Particle[]>([]);

  const generateParticles = () => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        // Explode outwards randomly
        tx: (Math.random() - 0.5) * 300, 
        ty: (Math.random() - 1) * 200, // Mostly up
        r: Math.random() * 360,
        delay: Math.random() * 0.2
      });
    }
    setParticles(newParticles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      await saveEmail(email);
      setStatus('success');
      generateParticles();
      setEmail('');
    } catch (error) {
      console.error("Failed to save email", error);
      setStatus('idle');
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Success State Overlay */}
      {status === 'success' ? (
        <div className="animate-fade-in-up relative">
          <div className="flex items-center gap-3 text-white">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/20">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-lg font-light tracking-wide">Access Reserved.</div>
              <div className="text-xs text-neutral-500 uppercase tracking-widest mt-0.5">We'll be in touch</div>
            </div>
          </div>
          
          {/* Minimal Confetti Layer */}
          <div className="absolute top-4 left-4 pointer-events-none w-0 h-0 overflow-visible">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute w-1.5 h-1.5 bg-white/60 animate-confetti"
                style={{
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                  '--r': `${p.r}deg`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Form State */
        <form 
          onSubmit={handleSubmit} 
          className={`w-full transition-all duration-500 ${status === 'loading' ? 'opacity-80' : 'opacity-100'}`}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center border-b border-white/20 pb-2 focus-within:border-white/60 transition-colors duration-500 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-transparent text-white placeholder-neutral-600 focus:outline-none font-light text-lg py-2"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="text-white hover:text-neutral-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5 opacity-80 hover:opacity-100" />
              )}
            </button>
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-widest text-neutral-600 text-center sm:text-left h-4">
            Beta Access Q4 2025
          </p>
        </form>
      )}
    </div>
  );
};

export default WaitlistForm;
