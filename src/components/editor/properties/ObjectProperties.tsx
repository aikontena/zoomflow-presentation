import React from 'react';
import { useCanvasStore, CanvasObject } from '@/lib/canvas-store';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify,
  Palette,
  Layers,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react';

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

const FONT_FAMILIES = [
  'Arial', 'Calibri', 'Aptos', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma',
  'Trebuchet MS', 'Helvetica', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Inter', 'Nunito', 'Playfair Display', 'Merriweather', 'Oswald',
  'Raleway', 'Source Sans Pro'
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 72, 96, 144];

export const TextProperties = ({ object }: { object: CanvasObject }) => {
  const updateObject = useCanvasStore(state => state.updateObject);
  const handleChange = (patch: Partial<CanvasObject>) => updateObject(object.id, patch);

  const adjustFontSize = (delta: number) => {
    const currentSize = object.fontSize || 16;
    handleChange({ fontSize: Math.max(1, currentSize + delta) });
  };

  return (
    <>
      <PropertySection title="Text Content">
        <textarea
          value={object.text || ''}
          onChange={(e) => handleChange({ text: e.target.value })}
          className="w-full h-20 bg-neutral-50 border border-neutral-200 rounded px-2 py-2 text-xs outline-none focus:border-primary resize-none"
        />
      </PropertySection>

      <PropertySection title="Typography">
        <InputRow label="Font Family">
          <select
            value={object.fontFamily || 'Inter'}
            onChange={(e) => handleChange({ fontFamily: e.target.value })}
            className="w-32 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none text-neutral-900"
          >
            {FONT_FAMILIES.map(font => (
              <option key={font} value={font} className="text-neutral-900">{font}</option>
            ))}
          </select>
        </InputRow>

        <InputRow label="Font Size">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => adjustFontSize(-1)}
              className="p-1 hover:bg-neutral-100 rounded border border-neutral-200"
            >
              <Minus size={12} />
            </button>
            <div className="relative">
              <input
                type="number"
                value={object.fontSize || 16}
                onChange={(e) => handleChange({ fontSize: parseInt(e.target.value) || 16 })}
                className="w-12 bg-neutral-50 border border-neutral-200 rounded px-1 py-1 text-xs outline-none text-center"
              />
              <select
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                onChange={(e) => handleChange({ fontSize: parseInt(e.target.value) })}
              >
                {FONT_SIZES.map(size => (
                  <option key={size} value={size} className="text-neutral-900">{size}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => adjustFontSize(1)}
              className="p-1 hover:bg-neutral-100 rounded border border-neutral-200"
            >
              <Plus size={12} />
            </button>
          </div>
        </InputRow>

        <div className="flex gap-1 justify-between">
          {[
            { icon: Bold, key: 'fontWeight', activeVal: 'bold', defaultVal: 'normal' },
            { icon: Italic, key: 'fontStyle', activeVal: 'italic', defaultVal: 'normal' },
            { icon: Underline, key: 'textDecoration', activeVal: 'underline', defaultVal: 'none' },
            { icon: Strikethrough, key: 'textDecoration', activeVal: 'line-through', defaultVal: 'none' },
            { label: 'TT', key: 'textTransform', activeVal: 'uppercase', defaultVal: 'none' },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={() => {
                const currentVal = (object as any)[btn.key];
                handleChange({ [btn.key]: currentVal === btn.activeVal ? btn.defaultVal : btn.activeVal });
              }}
              className={`p-2 rounded border transition-colors flex items-center justify-center min-w-[32px] ${
                (object as any)[btn.key] === btn.activeVal ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {btn.icon ? <btn.icon size={14} /> : <span className="text-[10px] font-bold">{btn.label}</span>}
            </button>
          ))}
        </div>

        <div className="flex gap-1 justify-between">
          {[
            { icon: AlignLeft, val: 'left' },
            { icon: AlignCenter, val: 'center' },
            { icon: AlignRight, val: 'right' },
            { icon: AlignJustify, val: 'justify' },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={() => handleChange({ textAlign: btn.val as any })}
              className={`p-2 rounded border transition-colors ${
                (object.textAlign || 'left') === btn.val ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <btn.icon size={14} />
            </button>
          ))}
        </div>
      </PropertySection>

      <PropertySection title="Spacing">
        <InputRow label="Letter Spacing">
          <input
            type="number"
            step="0.1"
            value={object.letterSpacing || 0}
            onChange={(e) => handleChange({ letterSpacing: parseFloat(e.target.value) })}
            className="w-16 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none"
          />
        </InputRow>
        <InputRow label="Line Height">
          <input
            type="number"
            step="0.1"
            value={object.lineHeight || 1.2}
            onChange={(e) => handleChange({ lineHeight: parseFloat(e.target.value) })}
            className="w-16 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none"
          />
        </InputRow>
      </PropertySection>
      
      <PropertySection title="Appearance">
        <InputRow label="Color">
          <input
            type="color"
            value={object.fill || '#000000'}
            onChange={(e) => handleChange({ fill: e.target.value })}
            className="w-8 h-8 rounded border-none cursor-pointer"
          />
        </InputRow>
        <InputRow label="Highlight">
          <input
            type="color"
            value={object.highlight || 'transparent'}
            onChange={(e) => handleChange({ highlight: e.target.value })}
            className="w-8 h-8 rounded border-none cursor-pointer"
          />
        </InputRow>
        <InputRow label="Opacity">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={object.opacity ?? 1}
            onChange={(e) => handleChange({ opacity: parseFloat(e.target.value) })}
            className="w-24 accent-primary"
          />
        </InputRow>
      </PropertySection>
    </>
  );
};

export const MediaProperties = ({ object }: { object: CanvasObject }) => {
  const updateObject = useCanvasStore(state => state.updateObject);
  const handleChange = (patch: Partial<CanvasObject>) => updateObject(object.id, patch);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = object.type === 'video' ? 'video/*' : 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => handleChange({ src: event.target?.result as string });
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <>
      <PropertySection title="Media Source">
        <button
          onClick={handleUpload}
          className="w-full py-2 bg-neutral-900 text-white rounded text-[11px] font-bold hover:bg-neutral-800 transition-colors mb-2"
        >
          {object.src ? 'Replace Source' : 'Upload File'}
        </button>
        {object.type === 'video' && (
          <InputRow label="Embed URL">
             <input
              type="text"
              placeholder="YouTube/Vimeo link"
              className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none"
              onBlur={(e) => handleChange({ src: e.target.value, videoType: e.target.value.includes('youtube') ? 'youtube' : 'vimeo' })}
            />
          </InputRow>
        )}
      </PropertySection>

      <PropertySection title="Display">
        <InputRow label="Fit Mode">
          <select
            value={object.objectFit || 'contain'}
            onChange={(e) => handleChange({ objectFit: e.target.value as any })}
            className="w-24 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none text-neutral-900"
          >
            <option value="contain" className="text-neutral-900">Fit</option>
            <option value="cover" className="text-neutral-900">Fill</option>
            <option value="fill" className="text-neutral-900">Stretch</option>
          </select>
        </InputRow>
        <InputRow label="Radius">
          <input
            type="number"
            value={object.borderRadius || 0}
            onChange={(e) => handleChange({ borderRadius: parseInt(e.target.value) })}
            className="w-16 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none"
          />
        </InputRow>
      </PropertySection>

      <PropertySection title="Adjustments">
        {['brightness', 'contrast', 'saturation', 'blur'].map((adj) => (
          <InputRow key={adj} label={adj.charAt(0).toUpperCase() + adj.slice(1)}>
            <input
              type="range"
              min="0"
              max={adj === 'blur' ? 20 : 2}
              step="0.1"
              value={(object as any)[adj] ?? (adj === 'blur' ? 0 : 1)}
              onChange={(e) => handleChange({ [adj]: parseFloat(e.target.value) })}
              className="w-20 accent-primary"
            />
          </InputRow>
        ))}
      </PropertySection>

      {object.type === 'video' && (
        <PropertySection title="Playback">
          <div className="space-y-2">
            {[
              { label: 'Autoplay', key: 'autoplay' },
              { label: 'Loop', key: 'loop' },
              { label: 'Muted', key: 'muted' },
            ].map((opt) => (
              <div key={opt.key} className="flex items-center justify-between">
                <label className="text-xs text-neutral-500">{opt.label}</label>
                <input
                  type="checkbox"
                  checked={(object as any)[opt.key] || false}
                  onChange={(e) => handleChange({ [opt.key]: e.target.checked })}
                  className="rounded text-primary"
                />
              </div>
            ))}
          </div>
        </PropertySection>
      )}
    </>
  );
};

export const ShapeProperties = ({ object }: { object: CanvasObject }) => {
  const updateObject = useCanvasStore(state => state.updateObject);
  const handleChange = (patch: Partial<CanvasObject>) => updateObject(object.id, patch);

  return (
    <>
      <PropertySection title="Fill & Stroke">
        <InputRow label="Color">
          <input
            type="color"
            value={object.fill || '#3b82f6'}
            onChange={(e) => handleChange({ fill: e.target.value })}
            className="w-8 h-8 rounded border-none cursor-pointer"
          />
        </InputRow>
        <InputRow label="Stroke">
          <input
            type="color"
            value={object.stroke || '#000000'}
            onChange={(e) => handleChange({ stroke: e.target.value })}
            className="w-8 h-8 rounded border-none cursor-pointer"
          />
        </InputRow>
        <InputRow label="Stroke Width">
          <input
            type="number"
            value={object.strokeWidth || 0}
            onChange={(e) => handleChange({ strokeWidth: parseInt(e.target.value) })}
            className="w-16 bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs outline-none"
          />
        </InputRow>
      </PropertySection>

      <PropertySection title="Effects">
        <InputRow label="Shadow">
          <input
            type="checkbox"
            checked={object.shadow || false}
            onChange={(e) => handleChange({ shadow: e.target.checked })}
            className="rounded text-primary"
          />
        </InputRow>
        <InputRow label="Opacity">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={object.opacity ?? 1}
            onChange={(e) => handleChange({ opacity: parseFloat(e.target.value) })}
            className="w-24 accent-primary"
          />
        </InputRow>
      </PropertySection>
    </>
  );
};
