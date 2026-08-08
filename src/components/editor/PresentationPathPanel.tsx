import React from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { 
  Play, 
  Plus, 
  Trash2, 
  Copy, 
  GripVertical,
  Camera,
  Settings2,
  ChevronRight,
  ChevronDown,
  MonitorPlay,
  PlayCircle
} from 'lucide-react';
import { FramePreview } from './FramePreview';
import { useViewportController } from './ViewportController';

export function PresentationPathPanel() {
  const { 
    objects, 
    presentationPath, 
    setPresentationPath, 
    selection, 
    setSelection,
    addObject,
    updateObject,
    deleteObjects,
    startPresentation,
    viewport
  } = useCanvasStore();
  
  const { zoomToFrame } = useViewportController();

  const handleAddStep = () => {
    // Add a new frame based on current viewport
    const id = addObject({
      type: 'frame',
      x: (window.innerWidth / 2 - viewport.x) / viewport.zoom - 400,
      y: (window.innerHeight / 2 - viewport.y) / viewport.zoom - 225,
      width: 800,
      height: 450,
      rotation: viewport.rotation || 0,
      fill: '#ffffff',
      text: `Step ${presentationPath.length + 1}`,
      settings: {
        duration: 1200,
        easing: 'smooth',
        camera: { ...viewport }
      }
    });
  };

  const handleDuplicateStep = (id: string) => {
    const frame = objects.find(o => o.id === id);
    if (!frame) return;
    
    addObject({
      type: 'frame',
      x: (window.innerWidth / 2 - viewport.x) / viewport.zoom - 400,
      x: frame.x + 50,
      y: frame.y + 50
    });
  };

  const handleDeleteStep = (id: string) => {
    deleteObjects([id]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50/30">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <MonitorPlay size={16} className="text-primary" />
          Presentation Path
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => startPresentation()}
            className="p-1.5 hover:bg-primary/10 text-primary rounded-md transition-colors"
            title="Present All"
          >
            <Play size={16} fill="currentColor" />
          </button>
          <button 
            onClick={handleAddStep}
            className="p-1.5 hover:bg-neutral-100 text-neutral-600 rounded-md transition-colors"
            title="Add Step"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {presentationPath.length > 0 ? (
          presentationPath.map((frameId, index) => {
            const frame = objects.find(o => o.id === frameId);
            if (!frame) return null;
            const isSelected = selection.includes(frameId);

            return (
              <div 
                key={frameId}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('frameIndex', index.toString());
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndexRaw = e.dataTransfer.getData('frameIndex');
                  if (!fromIndexRaw) return;
                  const fromIndex = parseInt(fromIndexRaw);
                  const newPath = [...presentationPath];
                  const [removed] = newPath.splice(fromIndex, 1);
                  if (!removed) return;
                  newPath.splice(index, 0, removed);
                  setPresentationPath(newPath);
                }}
                className={`group relative flex flex-col rounded-xl border-2 transition-all ${
                  isSelected ? 'border-primary shadow-md ring-2 ring-primary/5' : 'border-neutral-100 hover:border-neutral-200 shadow-sm'
                }`}
              >
                <div className="flex items-start p-2 gap-3">
                  <div className="mt-1 text-neutral-300 group-hover:text-neutral-400 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} />
                  </div>
                  
                  <div 
                    onClick={() => {
                      setSelection([frameId]);
                      zoomToFrame(frameId);
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                        Step {index + 1}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); startPresentation(frameId); }}
                          className="p-1 hover:bg-primary/10 text-primary rounded"
                          title="Play from Here"
                        >
                          <PlayCircle size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDuplicateStep(frameId); }}
                          className="p-1 hover:bg-neutral-100 text-neutral-500 rounded"
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteStep(frameId); }}
                          className="p-1 hover:bg-red-50 text-red-500 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-24 aspect-video rounded-md overflow-hidden border border-neutral-100 bg-neutral-50 relative shrink-0">
                        <FramePreview frame={frame} allObjects={objects} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <input 
                          value={frame.text || ''}
                          onChange={(e) => updateObject(frameId, { text: e.target.value })}
                          className="w-full text-xs font-semibold text-neutral-900 bg-transparent border-none p-0 focus:ring-0 truncate"
                          placeholder="Untitled Step"
                        />
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded font-medium">
                            {frame.settings?.duration || 1200}ms
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded font-medium capitalize">
                            {frame.settings?.easing || 'smooth'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 rounded-b-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase">Transition</label>
                        <select 
                          value={frame.settings?.duration || 1200}
                          onChange={(e) => updateObject(frameId, { 
                            settings: { ...frame.settings!, duration: parseInt(e.target.value) } 
                          })}
                          className="w-full text-[10px] bg-white border border-neutral-200 rounded px-1.5 py-1 outline-none"
                        >
                          <option value="200">0.2s</option>
                          <option value="500">0.5s</option>
                          <option value="1000">1.0s</option>
                          <option value="2000">2.0s</option>
                          <option value="3000">3.0s</option>
                          <option value="5000">5.0s</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase">Animation</label>
                        <select 
                          value={frame.settings?.easing || 'smooth'}
                          onChange={(e) => updateObject(frameId, { 
                            settings: { ...frame.settings!, easing: e.target.value as any } 
                          })}
                          className="w-full text-[10px] bg-white border border-neutral-200 rounded px-1.5 py-1 outline-none"
                        >
                          <option value="smooth">Smooth</option>
                          <option value="ease">Ease</option>
                          <option value="ease-in">Ease In</option>
                          <option value="ease-out">Ease Out</option>
                          <option value="ease-in-out">Ease In Out</option>
                          <option value="cinematic">Cinematic</option>
                          <option value="bounce">Bounce</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1">
                       <button 
                        onClick={() => {
                          updateObject(frameId, { 
                            settings: { 
                              ...frame.settings!, 
                              camera: { ...viewport } 
                            } 
                          });
                        }}
                        className="text-[10px] flex items-center gap-1.5 text-neutral-600 hover:text-primary transition-colors"
                      >
                        <Camera size={12} />
                        Update Camera Position
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400 uppercase">Speaker Notes</label>
                      <textarea 
                        value={frame.speakerNotes || ''}
                        onChange={(e) => updateObject(frameId, { speakerNotes: e.target.value })}
                        className="w-full h-16 text-[10px] bg-white border border-neutral-200 rounded px-2 py-1.5 outline-none resize-none"
                        placeholder="Add notes..."
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-neutral-100 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
              <Plus size={24} className="text-neutral-300" />
            </div>
            <p className="text-sm font-medium text-neutral-900 mb-1">No presentation path yet</p>
            <p className="text-xs text-neutral-400 mb-4">Start by adding your first presentation step.</p>
            <button 
              onClick={handleAddStep}
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              Add Step 1
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-neutral-100 bg-neutral-50/30">
        <button 
          onClick={() => useCanvasStore.getState().setActiveOverlay('settings')}
          className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Settings2 size={14} />
          Path Settings
        </button>
      </div>
    </div>
  );
}
