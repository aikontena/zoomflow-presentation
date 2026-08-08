import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Layout, Info, Sparkles, Check } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: 'preserve' | 'convert' | 'ai') => void;
  fileName: string;
  fileType: 'pptx' | 'pdf';
}

export const ImportModal: React.FC<ImportModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  fileName, 
  fileType 
}) => {
  const [selectedMode, setSelectedMode] = React.useState<'preserve' | 'convert' | 'ai'>('preserve');

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 z-[101] animate-in zoom-in-95 duration-200 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              Import {fileType === 'pptx' ? 'PowerPoint' : 'PDF'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mb-6">
            <div className="bg-neutral-50 p-3 rounded-lg mb-4 border border-neutral-100">
              <p className="text-xs text-neutral-500 font-medium">Selected File</p>
              <p className="text-sm text-neutral-800 font-bold truncate">{fileName}</p>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed font-medium">
              Step 2: Choose Import Mode
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setSelectedMode('preserve')}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all group relative ${
                selectedMode === 'preserve' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className={`mt-0.5 p-2 rounded-lg ${selectedMode === 'preserve' ? 'bg-primary/20' : 'bg-neutral-100 group-hover:bg-neutral-200'}`}>
                <FileText className={selectedMode === 'preserve' ? 'text-primary' : 'text-neutral-500'} size={20} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-neutral-900">Preserve Original</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-primary text-white rounded font-bold uppercase tracking-wider">Default</span>
                  {selectedMode === 'preserve' && <Check className="text-primary ml-auto" size={16} />}
                </div>
                <p className="text-xs text-neutral-500 leading-normal">
                  Imports exact screenshots of your slides. Visually identical to the source file. Read-only content with editable annotations.
                </p>
              </div>
            </button>

            <button
              onClick={() => setSelectedMode('convert')}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all group relative ${
                selectedMode === 'convert' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className={`mt-0.5 p-2 rounded-lg ${selectedMode === 'convert' ? 'bg-primary/20' : 'bg-neutral-100 group-hover:bg-neutral-200'}`}>
                <Layout className={selectedMode === 'convert' ? 'text-primary' : 'text-neutral-500'} size={20} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-neutral-900">Editable Conversion</span>
                  {selectedMode === 'convert' && <Check className="text-primary ml-auto" size={16} />}
                </div>
                <p className="text-xs text-neutral-500 leading-normal">
                  Converts slides into editable text and shape objects. Best for redesigning your presentation within ZoomCanvas.
                </p>
              </div>
            </button>

            <button
              onClick={() => setSelectedMode('ai')}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all group relative ${
                selectedMode === 'ai' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <div className={`mt-0.5 p-2 rounded-lg ${selectedMode === 'ai' ? 'bg-primary/20' : 'bg-neutral-100 group-hover:bg-neutral-200'}`}>
                <Sparkles className={selectedMode === 'ai' ? 'text-primary' : 'text-neutral-500'} size={20} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-neutral-900">AI Zoom Conversion</span>
                  {selectedMode === 'ai' && <Check className="text-primary ml-auto" size={16} />}
                </div>
                <p className="text-xs text-neutral-500 leading-normal">
                  Analyzes content and automatically generates a dynamic Prezi-style spatial layout with cinematic transitions.
                </p>
              </div>
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Info className="text-blue-600 shrink-0 mt-0.5" size={16} />
              <p className="text-[11px] text-blue-700 leading-tight">
                <strong>Non-Destructive Guarantee:</strong> Your original document is never modified. All annotations are stored in a separate layer.
              </p>
            </div>
            
            <button
              onClick={() => onConfirm(selectedMode)}
              className="w-full h-11 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Start Import
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};