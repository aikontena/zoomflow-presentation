import React from 'react';
import { useCanvasStore, CanvasObject } from '@/lib/canvas-store';
import { 
  Palette, 
  Maximize, 
  Square, 
  Grid, 
  Layout, 
  Monitor,
  ChevronDown,
  Upload,
  Layers,
  Box,
  LayoutTemplate
} from 'lucide-react';
import { toast } from 'sonner';

interface PropertySectionProps {
  title: string;
  children: React.ReactNode;
}

const PropertySection = ({ title, children }: PropertySectionProps) => (
  <div className="py-4 border-b border-neutral-100 last:border-0">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{title}</h3>
      <ChevronDown size={12} className="text-neutral-300" />
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const InputRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4">
    <label className="text-xs text-neutral-500">{label}</label>
    <div className="flex-1 flex justify-end">{children}</div>
  </div>
);

export const SlideDesignProperties = ({ object }: { object: CanvasObject }) => {
  const updateObject = useCanvasStore(state => state.updateObject);
  const objects = useCanvasStore(state => state.objects);
  
  const design: NonNullable<CanvasObject['frameDesign']> = {
    backgroundType: 'solid',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'solid',
    borderRadius: 0,
    aspectRatio: '16:9',
    layout: 'blank',
    shadow: 'none',
    opacity: 1,
    blur: 0,
    ...(object.frameDesign || {})
  };


  const updateDesign = (patch: Partial<NonNullable<CanvasObject['frameDesign']>>) => {
    updateObject(object.id, { 
      frameDesign: { ...design, ...patch } 
    });
  };

  const applyToAll = () => {
    const frames = objects.filter(o => o.type === 'frame');
    frames.forEach(frame => {
      updateObject(frame.id, { frameDesign: design });
    });
    toast.success(`Applied style to all ${frames.length} slides`);
  };

  return (
    <div className="bg-primary/5 -mx-4 px-4 py-2 border-y border-primary/10 mb-4 shadow-inner">
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Palette size={14} strokeWidth={2.5} />
        <h2 className="text-xs font-black uppercase tracking-tighter">Slide Design Engine</h2>
      </div>
      <PropertySection title="Background Layout">
        <InputRow label="Type">
          <select
            value={design.backgroundType}
            onChange={(e) => updateDesign({ backgroundType: e.target.value as any })}
            className="w-24 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none text-neutral-900"
          >
            <option value="solid">Solid</option>
            <option value="gradient">Gradient</option>
            <option value="mixed">Mixed</option>
            <option value="image">Image</option>
            <option value="pattern">Pattern</option>
            <option value="texture">Texture</option>
          </select>
        </InputRow>

        {design.backgroundType === 'solid' && (
          <InputRow label="Color">
            <input
              type="color"
              value={design.backgroundColor || '#ffffff'}
              onChange={(e) => updateDesign({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded border-none cursor-pointer"
            />
          </InputRow>
        )}

        {design.backgroundType === 'gradient' && (
          <div className="space-y-2">
            <textarea
              placeholder="linear-gradient(to right, #ff0000, #00ff00)"
              value={design.backgroundGradient || ''}
              onChange={(e) => updateDesign({ backgroundGradient: e.target.value })}
              className="w-full h-16 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-[10px] outline-none font-mono"
            />
          </div>
        )}

        {design.backgroundType === 'image' && (
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => updateDesign({ backgroundImage: event.target?.result as string });
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            className="w-full py-2 bg-neutral-900 text-white rounded text-[11px] font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={12} /> Upload Background
          </button>
        )}
      </PropertySection>

      <PropertySection title="Border & Corners">
        <InputRow label="Color">
          <input
            type="color"
            value={design.borderColor || '#000000'}
            onChange={(e) => updateDesign({ borderColor: e.target.value })}
            className="w-8 h-8 rounded border-none cursor-pointer"
          />
        </InputRow>
        <InputRow label="Width">
          <input
            type="number"
            value={design.borderWidth || 0}
            onChange={(e) => updateDesign({ borderWidth: parseInt(e.target.value) })}
            className="w-16 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none"
          />
        </InputRow>
        <InputRow label="Style">
          <select
            value={design.borderStyle || 'solid'}
            onChange={(e) => updateDesign({ borderStyle: e.target.value as any })}
            className="w-24 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none text-neutral-900"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
          </select>
        </InputRow>
        <InputRow label="Radius">
          <input
            type="number"
            value={design.borderRadius || 0}
            onChange={(e) => updateDesign({ borderRadius: parseInt(e.target.value) })}
            className="w-16 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none"
          />
        </InputRow>
      </PropertySection>

      <PropertySection title="Layout & Size">
        <InputRow label="Aspect Ratio">
          <select
            value={design.aspectRatio || '16:9'}
            onChange={(e) => {
              const ratio = e.target.value as NonNullable<NonNullable<CanvasObject['frameDesign']>['aspectRatio']>;
              let width = object.width;
              let height = object.height;
              
              if (ratio === '16:9') height = width * (9/16);
              else if (ratio === '4:3') height = width * (3/4);
              else if (ratio === 'A4-L') { width = 1123; height = 794; }
              else if (ratio === 'A4-P') { width = 794; height = 1123; }
              
              updateObject(object.id, { 
                width, 
                height,
                frameDesign: { ...design, aspectRatio: ratio } 
              });
            }}
            className="w-24 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none text-neutral-900"
          >
            <option value="16:9">16:9 HD</option>
            <option value="4:3">4:3 Standard</option>
            <option value="A4-L">A4 Landscape</option>
            <option value="A4-P">A4 Portrait</option>
            <option value="custom">Custom</option>
          </select>
        </InputRow>
        
        <InputRow label="Layout Preset">
          <select
            value={design.layout || 'blank'}
            onChange={(e) => updateDesign({ layout: e.target.value as any })}
            className="w-24 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none text-neutral-900"
          >
            <option value="blank">Blank</option>
            <option value="title">Title Only</option>
            <option value="content">Title + Content</option>
            <option value="split">Two Columns</option>
            <option value="three-col">Three Columns</option>
            <option value="comparison">Comparison</option>
            <option value="img-left">Image Left</option>
            <option value="img-right">Image Right</option>
            <option value="quote">Quote</option>
            <option value="divider">Section Divider</option>
          </select>
        </InputRow>
      </PropertySection>

      <PropertySection title="Slide Style">
        <InputRow label="Presets">
          <select
            value={design.shadow || 'none'}
            onChange={(e) => updateDesign({ shadow: e.target.value as any })}
            className="w-24 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none text-neutral-900"
          >
            <option value="none">Default</option>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="glass">Glass Morph</option>
            <option value="corporate">Corporate</option>
            <option value="academic">Academic</option>
            <option value="minimal">Minimal</option>
            <option value="creative">Creative</option>
            <option value="card">Shadow Card</option>
          </select>
        </InputRow>
        <InputRow label="Opacity">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={design.opacity ?? 1}
            onChange={(e) => updateDesign({ opacity: parseFloat(e.target.value) })}
            className="w-20 accent-primary"
          />
        </InputRow>
        <InputRow label="Blur">
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={design.blur ?? 0}
            onChange={(e) => updateDesign({ blur: parseInt(e.target.value) })}
            className="w-20 accent-primary"
          />
        </InputRow>
      </PropertySection>

      <div className="pt-4 space-y-2">
        <button
          onClick={applyToAll}
          className="w-full py-2 bg-primary/5 text-primary border border-primary/10 rounded text-[10px] font-bold hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
        >
          <LayoutTemplate size={12} /> Apply to All Slides
        </button>
      </div>
    </div>
  );
};
