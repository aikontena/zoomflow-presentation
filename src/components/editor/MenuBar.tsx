import React, { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { 
  ChevronRight, 
  ExternalLink,
  Keyboard,
  Upload
} from 'lucide-react';
import { SlideImporter } from '@/lib/slide-importer';
import { toast } from 'sonner';


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
    loadDocument
  } = useCanvasStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading(`Converting ${file.name}...`);

    try {
      const doc = await SlideImporter.importFile(file);
      loadDocument(doc);
      toast.success(`${file.name} converted to ZoomCanvas format!`, { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Failed to convert file', { id: toastId });
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
        { label: 'Text', action: () => addObject({ type: 'text', x: 100, y: 100, width: 200, height: 50, rotation: 0, fill: '#000000', text: 'New Text' }) },
        { label: 'Rectangle', action: () => addObject({ type: 'rectangle', x: 100, y: 100, width: 100, height: 100, rotation: 0, fill: '#3b82f6' }) },
        { label: 'Circle', action: () => addObject({ type: 'circle', x: 100, y: 100, width: 100, height: 100, rotation: 0, fill: '#3b82f6' }) },
        { label: 'Arrow', comingSoon: true },
        { label: 'Line', comingSoon: true },
        { label: 'Image', action: () => setActiveOverlay('templates') }, // or asset library
        { label: 'Icon', action: () => { /* UI focuses icons in sidebar */ } },
        { label: 'Video', comingSoon: true },
        { label: 'Import PPTX / PDF', action: () => fileInputRef.current?.click() },
        { label: 'Chart', comingSoon: true },

        { label: 'Table', comingSoon: true },
        { label: 'Sticky Note', comingSoon: true },
        { label: 'Comment', comingSoon: true },
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
    <div className="h-8 bg-neutral-50 border-b border-neutral-200 flex items-center px-2 select-none relative z-50" ref={menuRef}>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf,.pptx"
        onChange={handleFileUpload}
      />
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
              <div className="absolute top-full left-0 mt-0.5 w-56 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 animate-in fade-in slide-in-from-top-1 duration-150">
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
                      <div className="absolute top-0 left-full ml-px w-48 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 hidden group-hover/item:block animate-in fade-in slide-in-from-left-1 duration-150">
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
      
      <div className="ml-auto flex items-center gap-4 pr-2">
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
          <Keyboard size={12} />
          <span>Shortcuts Active</span>
        </div>
      </div>
    </div>
  );
}
