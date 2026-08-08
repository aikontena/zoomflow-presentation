import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';

export const AIPanel: React.FC = () => {
  const [prompt, setPrompt] = useState(`'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''

# Build Professional Application Menu Bar



The editor currently has only an object toolbar.



It is missing the main application menu.



Build a professional Menu Bar similar to Microsoft PowerPoint, Canva, Figma and Prezi.



Do not redesign the current editor.



Add a new Menu Bar above the object toolbar.



--------------------------------------------------

MENU STRUCTURE

--------------------------------------------------



File



Edit



Insert



View



Arrange



Present



Export



Share



Help



--------------------------------------------------

FILE MENU

--------------------------------------------------



New Presentation



Open Presentation



Open Recent



Save



Save As



Duplicate



Rename



Close



Print



Export



Project Settings



Exit



--------------------------------------------------

EDIT MENU

--------------------------------------------------



Undo



Redo



Cut



Copy



Paste



Duplicate



Delete



Select All



Find



Replace



Preferences



--------------------------------------------------

INSERT MENU

--------------------------------------------------



Frame



Text



Rectangle



Circle



Arrow



Line



Image



Icon



Video



PDF



Chart



Table



Sticky Note



Comment



--------------------------------------------------

VIEW MENU

--------------------------------------------------



Zoom In



Zoom Out



Fit to Screen



Reset Zoom



Toggle Grid



Toggle Rulers



Toggle Minimap



Toggle Navigator



Fullscreen



Dark Mode



--------------------------------------------------

ARRANGE MENU

--------------------------------------------------



Bring Forward



Send Backward



Align Left



Align Center



Align Right



Align Top



Align Middle



Align Bottom



Distribute



Group



Ungroup



Lock



Unlock



--------------------------------------------------

PRESENT MENU

--------------------------------------------------



Start Presentation



Presenter Mode



Presentation Settings



Transition Settings



Presentation Path



Speaker Notes



--------------------------------------------------

EXPORT MENU

--------------------------------------------------



PDF



PowerPoint (.pptx)



HTML



PNG



JPEG



SVG



MP4 (placeholder)



--------------------------------------------------

SHARE MENU

--------------------------------------------------



Share Link



Invite Users



Copy Link



Publish



Version History



--------------------------------------------------

HELP MENU

--------------------------------------------------



Keyboard Shortcuts



Documentation



About



Report Bug



--------------------------------------------------

KEYBOARD SHORTCUTS

--------------------------------------------------



Ctrl+N = New



Ctrl+O = Open



Ctrl+S = Save



Ctrl+Shift+S = Save As



Ctrl+P = Print



Ctrl+Z = Undo



Ctrl+Shift+Z = Redo



Ctrl+C = Copy



Ctrl+V = Paste



Delete = Delete



F5 = Present



--------------------------------------------------

STATUS

--------------------------------------------------



Disable menu items that are not yet implemented.



Do not hide them.



Show "Coming Soon" where appropriate.



--------------------------------------------------

FINAL REQUIREMENT

--------------------------------------------------



The Menu Bar must be fully integrated with the existing editor and prepared for future implementation of every command.`);

  return (
    <div className="flex flex-col h-full bg-white -m-4">
      <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
        <h2 className="text-sm font-bold flex items-center gap-2 text-neutral-900">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Assistant
        </h2>
        <p className="text-[10px] text-neutral-500 mt-1">
          Describe what you want to build or modify.
        </p>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        <div className="flex-1 relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-full p-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs text-neutral-800 leading-relaxed resize-none bg-neutral-50/30"
            placeholder="Type your instructions here..."
          />
        </div>
        
        <button className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 active:scale-95">
          <Send size={16} />
          Execute Command
        </button>
      </div>
      
      <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center gap-2 text-[10px] text-neutral-400">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          AI Context Active
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
