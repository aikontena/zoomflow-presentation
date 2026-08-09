import React from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { 
  ChevronRight, 
  Keyboard,
  Upload,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Plus,
  Minus,
  Palette,
  Undo2,
  Redo2,
  Square,
  Circle as CircleIcon,
  Type,
  Layout,
  MousePointer2
} from 'lucide-react';
import { SlideImporter } from '@/lib/slide-importer';
import { toast } from 'sonner';
import { ImportModal } from './ImportModal';
import { useState, useEffect, useRef } from 'react';

const FONT_FAMILIES = [
  'Arial', 'Calibri', 'Aptos', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma',
  'Trebuchet MS', 'Helvetica', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Inter', 'Nunito', 'Playfair Display', 'Merriweather', 'Oswald',
  'Raleway', 'Source Sans Pro'
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 72, 96, 144];

const MenuBarTypography = () => {
  const { selection, objects, updateObject, undo, redo } = useCanvasStore();
  const selectedObjects = objects.filter(o => selection.includes(o.id));
  const textObjects = selectedObjects.filter(o => o.type === 'text');
  
  const updateSelectedText = (patch: any) => {
    textObjects.forEach(o => updateObject(o.id, patch));
  };

  const adjustFontSize = (delta: number) => {
    const firstText = textObjects[0];
    const currentSize = firstText?.fontSize || 16;
    updateSelectedText({ fontSize: Math.max(1, currentSize + delta) });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 bg-neutral-100/50 rounded-md px-1 border border-neutral-200/50 h-8">
        <button 
          onClick={() => undo()} 
          className="p-1.5 hover:bg-neutral-200 rounded text-neutral-600 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={13} />
        </button>
        <button 
          onClick={() => redo()} 
          className="p-1.5 hover:bg-neutral-200 rounded text-neutral-600 transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={13} />
        </button>
      </div>

      {textObjects.length > 0 && (
        <div className="flex items-center gap-1 h-8 bg-neutral-100/50 rounded-md px-1.5 border border-neutral-200/50">
          {/* Font Family */}
          <select
            value={textObjects[0]?.fontFamily || 'Inter'}
            onChange={(e) => updateSelectedText({ fontFamily: e.target.value })}
            className="h-6 bg-transparent text-[11px] font-medium outline-none text-neutral-900 min-w-[80px]"
          >
            {FONT_FAMILIES.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>

          <div className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Font Size */}
          <div className="flex items-center">
            <button onClick={() => adjustFontSize(-1)} className="p-1 hover:bg-neutral-200 rounded">
              <Minus size={12} className="text-neutral-600" />
            </button>
            <input
              type="number"
              value={textObjects[0]?.fontSize || 16}
              onChange={(e) => updateSelectedText({ fontSize: parseInt(e.target.value) || 16 })}
              className="w-8 bg-transparent text-[11px] font-medium text-center outline-none text-neutral-900"
            />
            <button onClick={() => adjustFontSize(1)} className="p-1 hover:bg-neutral-200 rounded">
              <Plus size={12} className="text-neutral-600" />
            </button>
          </div>

          <div className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Formatting */}
          <div className="flex items-center gap-0.5">
            {[
              { icon: Bold, key: 'fontWeight', activeVal: 'bold', defaultVal: 'normal' },
              { icon: Italic, key: 'fontStyle', activeVal: 'italic', defaultVal: 'normal' },
              { icon: Underline, key: 'textDecoration', activeVal: 'underline', defaultVal: 'none' },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={() => {
                  const firstText = textObjects[0];
                  if (!firstText) return;
                  const currentVal = (firstText as any)[btn.key];
                  updateSelectedText({ [btn.key]: currentVal === btn.activeVal ? btn.defaultVal : btn.activeVal });
                }}
                className={`p-1 rounded transition-colors ${
                  textObjects[0] && (textObjects[0] as any)[btn.key] === btn.activeVal ? 'bg-primary text-white' : 'hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                <btn.icon size={13} />
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            {[
              { icon: AlignLeft, val: 'left' },
              { icon: AlignCenter, val: 'center' },
              { icon: AlignRight, val: 'right' },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={() => updateSelectedText({ textAlign: btn.val as any })}
                className={`p-1 rounded transition-colors ${
                  (textObjects[0]?.textAlign || 'left') === btn.val ? 'bg-primary text-white' : 'hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                <btn.icon size={13} />
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Color */}
          <div className="relative flex items-center">
            <input
              type="color"
              value={textObjects[0]?.fill || '#000000'}
              onChange={(e) => updateSelectedText({ fill: e.target.value })}
              className="w-4 h-4 rounded-sm border-none cursor-pointer p-0 overflow-hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  icon?: React.ReactNode;
  submenu?: MenuItem[];
}

interface MenuCategory {
  label: string;
  items: MenuItem[];
}

export default function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { 
    undo, 
    redo, 
    addObject, 
    save, 
    startPresentation, 
    setActiveOverlay,
    clear,
    duplicateObjects,
    selection,
    deleteObjects,
    setSelection,
    objects,
    bringForward,
    sendBackward,
    setViewport,
    viewport,
    updateObject,
    loadDocument,
    activeTool,
    setActiveTool
  } = useCanvasStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setPendingFile(file);
  };

  const confirmImport = async (mode: 'preserve' | 'convert' | 'ai') => {
    if (!pendingFile) return;
    
    const file = pendingFile;
    setPendingFile(null);
    setIsImporting(true);
    
    let statusText = 'Importing...';
    if (mode === 'convert') statusText = 'Converting...';
    if (mode === 'ai') statusText = 'Generating Spatial Path...';
    
    const toastId = toast.loading(`${statusText} ${file.name}`);

    try {
      const doc = await SlideImporter.importFile(file, mode);
      loadDocument(doc);
      toast.success(`${file.name} imported successfully!`, { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to import file', { id: toastId });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menus: MenuCategory[] = [
    {
      label: 'File',
      items: [
        { label: 'New Presentation', action: () => { if(confirm('Clear current canvas and start new?')) clear(); } },
        { label: 'Import PPTX / PDF', icon: <Upload size={12} />, action: () => fileInputRef.current?.click() },
        { label: 'Open Presentation', comingSoon: true },
        { label: 'Save', shortcut: 'Ctrl+S', action: () => save() },
        { label: 'Save As', shortcut: 'Ctrl+Shift+S', action: () => save() },
        { label: 'Duplicate', action: () => duplicateObjects(selection) },
        { label: 'Rename', comingSoon: true },
        { label: 'Close', comingSoon: true },
        { label: 'Print', shortcut: 'Ctrl+P', comingSoon: true },
        { label: 'Export', action: () => setActiveOverlay('export') },
        { label: 'Project Settings', action: () => setActiveOverlay('settings') },
        { label: 'Exit', action: () => window.close() },
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => undo() },
        { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => redo() },
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => { /* handled by canvas keyboard listeners */ } },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => { /* handled by canvas keyboard listeners */ } },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => { /* handled by canvas keyboard listeners */ } },
        { label: 'Duplicate', shortcut: 'Ctrl+D', action: () => duplicateObjects(selection) },
        { label: 'Delete', shortcut: 'Del', action: () => deleteObjects(selection) },
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => setSelection(objects.map(o => o.id)) },
        { label: 'Find', comingSoon: true },
        { label: 'Replace', comingSoon: true },
        { label: 'Preferences', comingSoon: true },
      ]
    },
    {
      label: 'Insert',
      items: [
        { label: 'Frame', action: () => addObject({ type: 'frame', x: 100, y: 100, width: 800, height: 450, rotation: 0, fill: '#ffffff', text: 'New Frame' }) },
        { label: 'Text', action: () => {
          const id = addObject({ type: 'text', x: 100, y: 100, width: 200, height: 50, rotation: 0, fill: '#000000', text: 'New Text', fontSize: 24, fontFamily: 'Inter' });
          if (id) setSelection([id]);
        }},
        { label: 'Rectangle', action: () => addObject({ type: 'rectangle', x: 100, y: 100, width: 100, height: 100, rotation: 0, fill: '#3b82f6' }) },
        { label: 'Circle', action: () => addObject({ type: 'circle', x: 100, y: 100, width: 100, height: 100, rotation: 0, fill: '#3b82f6' }) },
        { label: 'Image', action: () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => addObject({ type: 'image', x: 100, y: 100, width: 300, height: 200, rotation: 0, fill: 'transparent', src: event.target?.result as string });
              reader.readAsDataURL(file);
            }
          };
          input.click();
        }},
        { label: 'Video', action: () => addObject({ type: 'video', x: 100, y: 100, width: 480, height: 270, rotation: 0, fill: '#000000', text: 'Video Placeholder' }) },
        { label: 'Icon', action: () => setActiveOverlay('templates') },
        { label: 'Chart', comingSoon: true },
        { label: 'Table', comingSoon: true },
        { label: 'PDF', action: () => fileInputRef.current?.click() },
        { label: 'QR Code', comingSoon: true },
        { label: 'Equation', comingSoon: true },
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'Zoom In', shortcut: 'Ctrl++', action: () => setViewport({ ...viewport, zoom: (viewport.zoom || 1) * 1.2 }) },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => setViewport({ ...viewport, zoom: (viewport.zoom || 1) / 1.2 }) },
        { label: 'Fit to Screen', action: () => { /* implementation pending viewport controller access */ } },
        { label: 'Reset Zoom', shortcut: 'Ctrl+0', action: () => setViewport({ ...viewport, zoom: 1 }) },
        { label: 'Toggle Grid', comingSoon: true },
        { label: 'Toggle Rulers', comingSoon: true },
        { label: 'Toggle Minimap', comingSoon: true },
        { 
          label: useCanvasStore.getState().isRightSidebarVisible ? "Hide Properties" : "Show Properties", 
          action: () => useCanvasStore.getState().toggleRightSidebar() 
        },
        { label: 'Toggle Navigator', comingSoon: true },
        { label: 'Fullscreen', action: () => document.documentElement.requestFullscreen() },
        { label: 'Dark Mode', comingSoon: true },
      ]
    },
    {
      label: 'Arrange',
      items: [
        { label: 'Bring Forward', action: () => bringForward(selection) },
        { label: 'Send Backward', action: () => sendBackward(selection) },
        { label: 'Align Left', comingSoon: true },
        { label: 'Align Center', comingSoon: true },
        { label: 'Align Right', comingSoon: true },
        { label: 'Align Top', comingSoon: true },
        { label: 'Align Middle', comingSoon: true },
        { label: 'Align Bottom', comingSoon: true },
        { label: 'Distribute', comingSoon: true },
        { label: 'Group', action: () => { /* handled by store groupObjects */ } },
        { label: 'Ungroup', action: () => { /* handled by store ungroupObjects */ } },
        { label: 'Lock', action: () => selection.forEach(id => updateObject(id, { locked: true })) },
        { label: 'Unlock', action: () => selection.forEach(id => updateObject(id, { locked: false })) },
      ]
    },
    {
      label: 'Present',
      items: [
        { label: 'Start Presentation', shortcut: 'F5', action: () => startPresentation() },
        { label: 'Presenter Mode', action: () => startPresentation() },
        { label: 'Presentation Settings', action: () => setActiveOverlay('settings') },
        { label: 'Transition Settings', action: () => setActiveOverlay('settings') },
        { label: 'Presentation Path', action: () => { /* Sidebar handles this via tab change logic if we had access, otherwise just open settings */ setActiveOverlay('settings'); } },
        { 
          label: 'Presentation Type', 
          submenu: [
            { label: 'Spatial (Zoom)', action: () => useCanvasStore.getState().updatePresentationSettings({ type: 'spatial' }) },
            { label: 'Linear (Fade)', action: () => useCanvasStore.getState().updatePresentationSettings({ type: 'linear' }) },
            { label: 'Spiral', action: () => useCanvasStore.getState().updatePresentationSettings({ type: 'spiral' }) },
            { label: 'Grid', action: () => useCanvasStore.getState().updatePresentationSettings({ type: 'grid' }) },
          ] 
        },
        { label: 'Speaker Notes', comingSoon: true },
      ]
    },
    {
      label: 'Export',
      items: [
        { label: 'PDF', action: () => setActiveOverlay('export') },
        { label: 'PowerPoint (.pptx)', action: () => setActiveOverlay('export') },
        { label: 'HTML', action: () => setActiveOverlay('export') },
        { label: 'PNG', action: () => setActiveOverlay('export') },
        { label: 'JPEG', action: () => setActiveOverlay('export') },
        { label: 'SVG', action: () => setActiveOverlay('export') },
        { label: 'MP4 (Video)', comingSoon: true },
      ]
    },
    {
      label: 'Share',
      items: [
        { label: 'Share Link', comingSoon: true },
        { label: 'Invite Users', comingSoon: true },
        { label: 'Copy Link', comingSoon: true },
        { label: 'Publish', comingSoon: true },
        { label: 'Version History', comingSoon: true },
      ]
    },
    {
      label: 'Help',
      items: [
        { label: 'Keyboard Shortcuts', action: () => alert('Keyboard Shortcuts\n\nCtrl+N: New\nCtrl+S: Save\nCtrl+Z: Undo\nF5: Present\n...') },
        { label: 'Documentation', action: () => window.open('https://docs.lovable.dev', '_blank') },
        { label: 'About', action: () => alert('ZoomCanvas AI v1.0.0\nProfessional Presentation Platform') },
        { label: 'Report Bug', comingSoon: true },
      ]
    }
  ];

  return (
    <div className="h-10 bg-neutral-50 border-b border-neutral-200 flex items-center px-2 select-none relative z-50" ref={menuRef}>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf,.pptx"
        onChange={handleFileUpload}
      />
      <div className="flex items-center gap-1 border-r border-neutral-200 pr-2 mr-2">
        {[
          { id: 'select', icon: MousePointer2, label: 'Select' },
          { id: 'frame', icon: Layout, label: 'Frame' },
          { id: 'text', icon: Type, label: 'Text' },
          { id: 'rect', icon: Square, label: 'Rectangle' },
          { id: 'circle', icon: CircleIcon, label: 'Circle' },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as any)}
            className={`p-1.5 rounded transition-colors ${
              activeTool === tool.id ? 'bg-primary text-white' : 'hover:bg-neutral-200 text-neutral-600'
            }`}
            title={tool.label}
          >
            <tool.icon size={14} />
          </button>
        ))}
      </div>
      <div className="flex items-center">
        {menus.map((menu) => (
          <div key={menu.label} className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
              onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
              className={`px-3 h-6 flex items-center text-[11px] font-medium rounded transition-colors ${
                activeMenu === menu.label 
                  ? 'bg-neutral-200 text-neutral-900' 
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {menu.label}
            </button>

            {activeMenu === menu.label && (
              <div className="absolute top-full left-0 mt-0.5 w-56 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 animate-in fade-in slide-in-from-top-1 duration-150 text-neutral-900">
                {menu.items.map((item, idx) => (
                  <div key={`${item.label}-${idx}`} className="relative group/item">
                    <button
                      disabled={item.comingSoon}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                          setActiveMenu(null);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] ${
                        item.comingSoon 
                          ? 'text-neutral-300 cursor-not-allowed' 
                          : 'text-neutral-700 hover:bg-primary hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {item.icon}
                        {item.label}
                        {item.comingSoon && (
                          <span className="text-[9px] px-1 rounded bg-neutral-100 text-neutral-400 group-hover:bg-white/20 group-hover:text-white">
                            Coming Soon
                          </span>
                        )}
                      </span>
                      {item.shortcut && (
                        <span className={`text-[10px] font-mono ${item.comingSoon ? 'text-neutral-200' : 'text-neutral-400 group-hover/item:text-white/70'}`}>
                          {item.shortcut}
                        </span>
                      )}
                      {item.submenu && <ChevronRight size={12} />}
                    </button>

                    {item.submenu && (
                      <div className="absolute top-0 left-full ml-px w-48 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 hidden group-hover/item:block animate-in fade-in slide-in-from-left-1 duration-150 text-neutral-900">
                        {item.submenu.map((sub, sidx) => (
                          <button
                            key={`${sub.label}-${sidx}`}
                            onClick={() => {
                              if (sub.action) sub.action();
                              setActiveMenu(null);
                            }}
                            className="w-full flex items-center px-3 py-1.5 text-[11px] text-neutral-700 hover:bg-primary hover:text-white"
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 flex justify-center">
        <MenuBarTypography />
      </div>
      
      <div className="ml-auto flex items-center gap-4 pr-2">
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
          <Keyboard size={12} />
          <span>Shortcuts Active</span>
        </div>
      </div>

      <ImportModal 
        isOpen={!!pendingFile}
        onClose={() => setPendingFile(null)}
        onConfirm={confirmImport}
        fileName={pendingFile?.name || ''}
        fileType={pendingFile?.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'pptx'}
      />
    </div>
  );
}