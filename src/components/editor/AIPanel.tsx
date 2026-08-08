import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Check, X, RefreshCcw, Layout, Image as ImageIcon, Type, Camera, Info, Trash2 } from 'lucide-react';
import { useCanvasStore, AiMessage, AiProposal } from '@/lib/canvas-store';
import { askAiAssistant } from '@/lib/ai/assistant.functions';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';

export const AIPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const { 
    aiMessages, 
    addAiMessage, 
    isAiThinking, 
    setAiThinking, 
    pendingAiProposal, 
    setPendingAiProposal,
    applyAiProposal,
    objects,
    presentationPath,
    selection,
    clearAiMessages
  } = useCanvasStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const askAi = useServerFn(askAiAssistant);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, isAiThinking]);

  const handleSend = async () => {
    if (!input.trim() || isAiThinking) return;

    const userMessage: AiMessage = { role: 'user', content: input };
    addAiMessage(userMessage);
    setInput('');
    setAiThinking(true);

    try {
      const context = {
        presentationTitle: "My Presentation",
        objects: objects.map(o => ({ id: o.id, type: o.type, x: o.x, y: o.y, text: o.text })),
        presentationPath,
        selectedObjectIds: selection
      };

      const response = await askAi({
        data: {
          messages: [...aiMessages, userMessage].map(m => ({ role: m.role, content: m.content })),
          context
        }
      });

      if (response.message) {
        addAiMessage({ 
          role: 'assistant', 
          content: response.message,
          proposal: response.proposal
        });
        
        if (response.proposal) {
          setPendingAiProposal(response.proposal);
        }
      }
    } catch (error) {
      console.error('AI Error:', error);
      toast.error("AI Assistant is currently unavailable");
    } finally {
      setAiThinking(false);
    }
  };

  const getProposalIcon = (type: AiProposal['type']) => {
    switch (type) {
      case 'create_presentation': return <Layout size={14} />;
      case 'add_objects': return <Type size={14} />;
      case 'update_objects': return <RefreshCcw size={14} />;
      case 'suggest_path': return <Camera size={14} />;
      case 'delete_objects': return <Trash2 size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-neutral-200">
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-tight">AI Presentation Co-pilot</h3>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-[9px] text-neutral-400 font-bold uppercase">Connected</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearAiMessages}
          className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
          title="Clear Chat"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {aiMessages.length === 0 && (
          <div className="space-y-6 pt-4">
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <h4 className="text-sm font-bold text-primary mb-2">How can I help you today?</h4>
              <p className="text-[11px] text-neutral-600 leading-relaxed mb-4">
                I can help you build spatial presentations, refine your content, suggest visuals, and optimize your camera paths.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Create a business presentation about AI trends",
                  "Rewrite my selected text to sound more professional",
                  "Suggest a better camera path for my slides",
                  "Generate speaker notes for this frame"
                ].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="text-left p-2.5 text-[10px] bg-white border border-neutral-100 rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all text-neutral-700 font-medium shadow-sm"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {aiMessages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-neutral-100 text-neutral-600' : 'bg-primary/10 text-primary border border-primary/20'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`space-y-2 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-neutral-900 text-white rounded-tr-none' 
                  : 'bg-neutral-50 border border-neutral-100 text-neutral-800 rounded-tl-none'
              }`}>
                {msg.content}
              </div>

              {msg.proposal && (
                <div className="bg-white border-2 border-primary/20 rounded-xl p-3 shadow-md space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 text-primary">
                    {getProposalIcon(msg.proposal.type)}
                    <span className="text-[10px] font-bold uppercase tracking-wider">AI Proposal</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 font-medium">{msg.proposal.description}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => applyAiProposal(msg.proposal!)}
                      className="flex-1 py-2 bg-primary text-white rounded-lg text-[10px] font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Check size={12} /> Apply Changes
                    </button>
                    <button 
                      onClick={() => setPendingAiProposal(null)}
                      className="px-3 py-2 bg-neutral-100 text-neutral-500 rounded-lg text-[10px] font-bold hover:bg-neutral-200 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isAiThinking && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center animate-pulse">
              <Bot size={14} />
            </div>
            <div className="bg-neutral-50 border border-neutral-100 p-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-neutral-200 bg-neutral-50/50">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI Assistant..."
            className="w-full h-24 bg-white border border-neutral-200 rounded-xl p-3 pr-12 text-xs outline-none focus:border-primary transition-all resize-none shadow-sm placeholder:text-neutral-400"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isAiThinking}
            className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all shadow-md active:scale-95 ${
              !input.trim() || isAiThinking ? 'bg-neutral-200 text-neutral-400' : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <button className="text-[10px] text-neutral-400 font-bold hover:text-primary transition-colors flex items-center gap-1">
              <Info size={12} /> Privacy
            </button>
          </div>
          <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-tight">Lovable AI v4.0</span>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
