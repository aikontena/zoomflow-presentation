import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

export const AIPanel: React.FC = () => {
  const [prompt, setPrompt] = useState(`'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                            
                                            Why the slide in the canvas not appear the same with the slide at the left side pages

Analyze the file at this link: https://aiframework.cloud/storage/v1/object/public/prompt-images/uploads/1786182681580-0c056dbc-9cef-4dcf-ba51-4ff2fa0fc69c.png`);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">AI Assistant</h3>
              <p className="text-xs text-neutral-500 font-medium">Generate anything with AI</p>
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create..."
              className="w-full h-48 bg-white border-2 border-neutral-100 rounded-xl p-4 text-sm outline-none focus:border-primary transition-all resize-none shadow-sm placeholder:text-neutral-400"
            />
            <button className="absolute bottom-3 right-3 bg-primary text-white p-2.5 rounded-lg hover:bg-primary-dark transition-colors shadow-md active:scale-95">
              <Send size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-2">
          <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Capabilities</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Slides', desc: 'Full presentations' },
              { label: 'Layouts', desc: 'Auto-arrange' },
              { label: 'Themes', desc: 'Color palettes' },
              { label: 'Content', desc: 'Copywriting' }
            ].map((cap, i) => (
              <div key={i} className="p-3 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group">
                <p className="text-xs font-bold text-neutral-800 group-hover:text-primary">{cap.label}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium uppercase tracking-tight">
          <span>AI Model: Lovable v2</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Ready
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
