import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Layout, Info } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: 'preserve' | 'convert') => void;
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
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 z-[101] animate-in zoom-in-95 duration-200 border border-neutral-200">
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
            <p className="text-sm text-neutral-500 mb-2 font-medium">File: {fileName}</p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              How would you like to import this presentation?
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => onConfirm('preserve')}
              className="w-full flex items-start gap-4 p-4 rounded-lg border-2 border-primary bg-primary/5 text-left transition-all hover:bg-primary/10 group relative"
            >
              <div className="mt-0.5 p-2 bg-primary/10 rounded-md group-hover:bg-primary/20">
                <FileText className="text-primary" size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-neutral-900">Preserve Original Presentation</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-primary text-white rounded font-bold uppercase tracking-wider">Recommended</span>
                </div>
                <p className="text-xs text-neutral-600 leading-normal">
                  Keep every slide exactly as it is. No layout changes, font replacements, or automatic redesigns.
                </p>
              </div>
            </button>

            <button
              onClick={() => onConfirm('convert')}
              className="w-full flex items-start gap-4 p-4 rounded-lg border-2 border-neutral-100 bg-neutral-50 text-left transition-all hover:border-neutral-200 hover:bg-neutral-100 group"
            >
              <div className="mt-0.5 p-2 bg-neutral-200 rounded-md group-hover:bg-neutral-300">
                <Layout className="text-neutral-600" size={20} />
              </div>
              <div className="flex-1">
                <span className="block font-bold text-sm text-neutral-900 mb-1">Convert to Zoom Presentation</span>
                <p className="text-xs text-neutral-600 leading-normal">
                  Automatically analyze content to suggest a zoom path and create fluid camera movements between slides.
                </p>
              </div>
            </button>
          </div>

          <div className="mt-6 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <Info className="text-amber-600 shrink-0" size={16} />
            <p className="text-[11px] text-amber-700 leading-tight">
              Non-Destructive Import: Your original document remains intact. You can convert to a Zoom Presentation later if needed.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
