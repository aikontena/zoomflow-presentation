import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, FileText, Globe, MessageSquare, History } from "lucide-react";
import { useEditor } from "@/lib/editor-store";
import { generatePresentation } from "@/lib/ai/presentation-generator.functions";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

export function AIPanel() {
  const { setGenerating, isGenerating, aiProgress, applyGeneration } = useEditor();
  const [prompt, setPrompt] = useState("'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''\n                                            \n                                            # CRITICAL ARCHITECTURE AUDIT\n\n\n\nDo NOT fix random bugs.\n\n\n\nDo NOT add new features.\n\n\n\nDo NOT regenerate the UI.\n\n\n\nYour only task is to perform a COMPLETE ARCHITECTURE AUDIT of the entire project before making any modifications.\n\n\n\nThe current Infinite Canvas frequently crashes, freezes, reloads unexpectedly, or becomes unusable.\n\n\n\nSeveral previous fixes have failed.\n\n\n\nI want a root-cause analysis, not another temporary patch.\n\n\n\n--------------------------------------------------\n\nPHASE 1\n\nFULL PROJECT INSPECTION\n\n--------------------------------------------------\n\n\n\nInspect every file.\n\n\n\nInspect every folder.\n\n\n\nInspect every dependency.\n\n\n\nInspect every route.\n\n\n\nInspect every provider.\n\n\n\nInspect every React component.\n\n\n\nInspect every custom hook.\n\n\n\nInspect every Zustand store.\n\n\n\nInspect every Context Provider.\n\n\n\nInspect every Supabase integration.\n\n\n\nInspect every canvas-related component.\n\n\n\nInspect every event listener.\n\n\n\nInspect every animation.\n\n\n\nInspect every autosave process.\n\n\n\nInspect every database subscription.\n\n\n\nInspect every rendering cycle.\n\n\n\n--------------------------------------------------\n\nPHASE 2\n\nFIND ROOT CAUSE\n\n--------------------------------------------------\n\n\n\nIdentify ALL possible causes of:\n\n\n\nCanvas crash\n\n\n\nBlank canvas\n\n\n\nUnexpected reload\n\n\n\nInfinite render\n\n\n\nInfinite rerender\n\n\n\nInfinite save loop\n\n\n\nMemory leak\n\n\n\nToo many re-renders\n\n\n\nReact warnings\n\n\n\nHydration issues\n\n\n\nZustand update loops\n\n\n\nCircular dependency\n\n\n\nRecursive rendering\n\n\n\nDuplicate subscriptions\n\n\n\nBroken event listeners\n\n\n\nUnreleased listeners\n\n\n\nRace conditions\n\n\n\nSupabase realtime loops\n\n\n\nLarge object serialization\n\n\n\nCanvas object duplication\n\n\n\nGPU overload\n\n\n\nAnimation loops\n\n\n\nUndo history explosion\n\n\n\nAutosave recursion\n\n\n\nMultiple React roots\n\n\n\nContext nesting problems\n\n\n\nLarge component tree\n\n\n\nHeavy object cloning\n\n\n\n--------------------------------------------------\n\nPHASE 3\n\nPERFORMANCE PROFILING\n\n--------------------------------------------------\n\n\n\nProfile:\n\n\n\nReact rendering\n\n\n\nMemory usage\n\n\n\nComponent updates\n\n\n\nLargest components\n\n\n\nLargest state objects\n\n\n\nLargest props\n\n\n\nLargest rerender sources\n\n\n\nFPS bottlenecks\n\n\n\nCPU spikes\n\n\n\nNetwork calls\n\n\n\nAutosave frequency\n\n\n\nDatabase writes\n\n\n\nDatabase reads\n\n\n\n--------------------------------------------------\n\nPHASE 4\n\nDEPENDENCY AUDIT\n\n--------------------------------------------------\n\n\n\nVerify compatibility of:\n\n\n\nReact\n\n\n\nTypeScript\n\n\n\nVite\n\n\n\nTailwind\n\n\n\nshadcn\n\n\n\nZustand\n\n\n\nSupabase\n\n\n\nFramer Motion\n\n\n\ntldraw\n\n\n\nReact Flow\n\n\n\nFabric\n\n\n\nKonva\n\n\n\nAll installed packages\n\n\n\nIdentify conflicting libraries.\n\n\n\nRemove duplicated functionality.\n\n\n\n--------------------------------------------------\n\nPHASE 5\n\nCANVAS AUDIT\n\n--------------------------------------------------\n\n\n\nInspect:\n\n\n\nCanvas Engine\n\n\n\nViewport\n\n\n\nZoom\n\n\n\nPan\n\n\n\nSelection\n\n\n\nLayers\n\n\n\nToolbar\n\n\n\nHistory\n\n\n\nUndo\n\n\n\nRedo\n\n\n\nAutosave\n\n\n\nMiniMap\n\n\n\nFrames\n\n\n\nObjects\n\n\n\nCamera\n\n\n\nPresentation Mode\n\n\n\nEnsure every module is independent.\n\n\n\n--------------------------------------------------\n\nPHASE 6\n\nSTATE MANAGEMENT\n\n--------------------------------------------------\n\n\n\nInspect Zustand.\n\n\n\nFind:\n\n\n\nDuplicate stores\n\n\n\nCircular updates\n\n\n\nDerived state loops\n\n\n\nSelectors causing rerenders\n\n\n\nLarge object mutations\n\n\n\nObject recreation\n\n\n\nNon-memoized selectors\n\n\n\nState synchronization issues\n\n\n\n--------------------------------------------------\n\nPHASE 7\n\nRENDERING\n\n--------------------------------------------------\n\n\n\nFind every component that rerenders unnecessarily.\n\n\n\nMemoize where appropriate.\n\n\n\nSplit large components.\n\n\n\nVirtualize heavy rendering.\n\n\n\nLazy-load nonessential modules.\n\n\n\nAvoid rendering invisible canvas objects.\n\n\n\n--------------------------------------------------\n\nPHASE 8\n\nERROR HANDLING\n\n--------------------------------------------------\n\n\n\nImplement:\n\n\n\nReact Error Boundary\n\n\n\nCanvas Error Boundary\n\n\n\nSafe Recovery\n\n\n\nAutosave Recovery\n\n\n\nCrash Recovery\n\n\n\nState Recovery\n\n\n\nPrevent a single component failure from crashing the editor.\n\n\n\n--------------------------------------------------\n\nPHASE 9\n\nREPORT\n\n--------------------------------------------------\n\n\n\nBefore changing any code,\n\n\n\nproduce a detailed report containing:\n\n\n\n1. Root causes\n\n\n\n2. File locations\n\n\n\n3. Severity\n\n\n\n4. Impact\n\n\n\n5. Recommended solution\n\n\n\n6. Files to modify\n\n\n\n7. Files to delete\n\n\n\n8. Files to refactor\n\n\n\n9. Estimated complexity\n\n\n\n10. Risk level\n\n\n\nDo NOT implement fixes until the report is complete.\n\n\n\n--------------------------------------------------\n\nPHASE 10\n\nREFACTOR PLAN\n\n--------------------------------------------------\n\n\n\nAfter the report,\n\n\n\ncreate a complete refactoring roadmap.\n\n\n\Prioritize:\n\n\n\nStability\n\n\n\nPerformance\n\n\n\nMaintainability\n\n\n\nScalability\n\n\n\nThe application must be stable before any new feature is added.\n\n\n\nNo temporary fixes.\n\n\n\nNo workarounds.\n\n\n\nOnly production-grade solutions.\");
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
