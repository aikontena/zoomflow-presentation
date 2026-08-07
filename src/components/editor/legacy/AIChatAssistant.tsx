import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User, Sparkles } from "lucide-react";
import { useEditor } from "@/lib/editor-store";
import { chatWithAssistant } from "@/lib/ai/ai-chat.functions";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user', content: string }[]>([
    { role: 'assistant', content: "Hi! I'm your AI presentation assistant. How can I help you refine your canvas today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { title, doc, activePageId, selectedIds } = useEditor();
  const chat = useServerFn(chatWithAssistant);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setMessage("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const currentPage = doc.pages.find(p => p.id === activePageId);
      const context = {
        presentationTitle: title,
        currentFrame: currentPage,
        selectedObjects: [], // Would fetch real selected objects if needed
        history: messages.slice(-5)
      };

      const response = await chat({ data: { message: userMsg, context } });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex h-[450px] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-sidebar/90 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-primary/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles size={14} />
                </div>
                <span className="text-sm font-semibold">AI Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[80%] gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] ${m.role === 'user' ? 'bg-secondary' : 'bg-primary/20 border-primary/20 text-primary'}`}>
                      {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    <div className={`rounded-2xl px-3 py-2 text-xs ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 border border-border'}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Bot size={12} />
                    </div>
                    <div className="rounded-2xl bg-secondary/50 border border-border px-3 py-2">
                      <Loader size={12} className="animate-spin" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-1.5 focus-within:border-primary/50">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything..."
                  className="w-full bg-transparent text-xs outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={!message.trim() || isTyping}
                  className="rounded-lg p-1 text-primary hover:bg-primary/10 disabled:opacity-30"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 ${isOpen ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground'}`}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>
    </div>
  );
}

function Loader({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
