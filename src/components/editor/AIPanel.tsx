import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, FileText, Globe, MessageSquare, History } from "lucide-react";
import { useEditor } from "@/lib/editor-store";
import { generatePresentation } from "@/lib/ai/presentation-generator.functions";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

export function AIPanel() {
  const { setGenerating, isGenerating, aiProgress, applyGeneration } = useEditor();
  const [prompt, setPrompt] = useState("'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                            \n                                            masih tak boleh guna aplikasi ini. tolong fix sampai dapat guna.");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [metadata, setMetadata] = useState({
    title: "",
    goal: "",
    audience: "",
    language: "English",
    length: "medium",
    style: "Modern",
    tone: "Professional",
  });

  const generate = useServerFn(generatePresentation);

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt or topic.");
      return;
    }

    try {
      setGenerating(true, 10);
      toast.info("AI is brainstorming your presentation...");
      
      const result = await generate({ data: { prompt, metadata } });
      
      setGenerating(true, 80);
      applyGeneration(result);
      
      setGenerating(false);
      toast.success("Presentation generated successfully!");
    } catch (error) {
      console.error(error);
      setGenerating(false);
      toast.error("Failed to generate presentation. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">AI Assistant</h3>
        <button className="text-muted-foreground hover:text-foreground">
          <History size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What should this presentation be about?"
            className="h-32 w-full resize-none rounded-xl border border-border bg-background/60 p-3 text-xs outline-none focus:border-primary/60"
          />
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button title="Upload document" className="rounded-lg p-1 hover:bg-secondary">
              <FileText size={14} className="text-muted-foreground" />
            </button>
            <button title="Import from URL" className="rounded-lg p-1 hover:bg-secondary">
              <Globe size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between p-3 text-[11px] font-medium hover:bg-secondary/40"
          >
            Generation Settings
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {showAdvanced && (
            <div className="border-t border-border p-3 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-tight">Title</label>
                <input 
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                  placeholder="Optional title"
                  className="w-full bg-transparent border-b border-border py-1 text-xs outline-none focus:border-primary/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-tight">Length</label>
                  <select 
                    value={metadata.length}
                    onChange={(e) => setMetadata({ ...metadata, length: e.target.value as any })}
                    className="w-full bg-transparent text-xs outline-none"
                  >
                    <option value="short">Short (3-5 frames)</option>
                    <option value="medium">Medium (6-10 frames)</option>
                    <option value="long">Long (12+ frames)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-tight">Tone</label>
                  <select 
                    value={metadata.tone}
                    onChange={(e) => setMetadata({ ...metadata, tone: e.target.value })}
                    className="w-full bg-transparent text-xs outline-none"
                  >
                    <option>Professional</option>
                    <option>Educational</option>
                    <option>Creative</option>
                    <option>Academic</option>
                    <option>Casual</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Generating {aiProgress}%</span>
              <div 
                className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-500" 
                style={{ width: `${aiProgress}%` }}
              />
            </>
          ) : (
            <>
              <Sparkles size={16} className="transition-transform group-hover:scale-110" />
              <span>Generate Presentation</span>
            </>
          )}
        </button>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Selected Context</h4>
        <div className="flex items-center gap-2 rounded-lg bg-secondary/30 p-2 text-[10px] text-muted-foreground">
          <MessageSquare size={12} />
          <span>Select objects on canvas to use as AI context</span>
        </div>
      </div>
    </div>
  );
}
