import React, { useState } from 'react';
import { Loader2, Terminal } from 'lucide-react';
import { generateValueProposition } from '../services/ai';
import { PersonalizedPitchProps } from '../types';

const Personalize: React.FC<PersonalizedPitchProps> = ({ className }) => {
  const [role, setRole] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!role.trim()) return;
    setLoading(true);
    setResponse('');
    
    try {
      const result = await generateValueProposition(role);
      setResponse(result);
    } catch (e) {
      setResponse("Scedge adapts to your workflow, no matter the role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto mt-24 ${className}`}>
      <div className="space-y-8 text-center sm:text-left">
        <div className="space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-neutral-500 text-xs uppercase tracking-widest font-medium">
            <Terminal className="w-3 h-3" />
            <span>Identify Role</span>
          </div>
          
          <div className="flex items-center gap-2">
             <span className="text-neutral-600 font-light hidden sm:inline-block">I am a</span>
             <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Product Manager..."
              className="bg-transparent text-white border-b border-neutral-800 focus:border-white focus:outline-none py-1 px-0 w-48 text-center sm:text-left font-light transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            />
            <button
              onClick={handleAskAI}
              disabled={loading || !role}
              className="text-xs text-white border border-white/20 hover:bg-white hover:text-black rounded px-3 py-1 transition-all disabled:opacity-0"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Enter"}
            </button>
          </div>
        </div>

        <div className="min-h-[80px]">
          {response && (
            <p className="text-lg text-white font-light leading-relaxed animate-fade-in">
              {response}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Personalize;