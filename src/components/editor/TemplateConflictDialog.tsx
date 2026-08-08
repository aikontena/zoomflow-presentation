import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Check } from 'lucide-react';
import { useCanvasStore } from '@/lib/canvas-store';

type Choice = 'keep' | 'new' | 'duplicate';

const OPTIONS: { value: Choice; label: string; description: string }[] = [
  {
    value: 'keep',
    label: 'Keep current presentation (Recommended)',
    description: 'Nothing changes. The selected canvas template is discarded.',
  },
  {
    value: 'new',
    label: 'Create a NEW presentation using the selected Canvas Template',
    description: 'Replaces the workspace with a fresh presentation built from the template.',
  },
  {
    value: 'duplicate',
    label: 'Duplicate current presentation, then apply the Canvas Template',
    description: 'Saves a copy of the current presentation first, then applies the template.',
  },
];

export const TemplateConflictDialog: React.FC = () => {
  const pendingTemplate = useCanvasStore((s) => s.pendingTemplate);
  const resolveTemplateConflict = useCanvasStore((s) => s.resolveTemplateConflict);
  const [choice, setChoice] = React.useState<Choice>('keep');

  React.useEffect(() => {
    if (pendingTemplate) setChoice('keep');
  }, [pendingTemplate]);

  return (
    <Dialog.Root
      open={!!pendingTemplate}
      onOpenChange={(open) => !open && resolveTemplateConflict('keep')}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 z-[1001] border border-neutral-200 animate-in zoom-in-95 duration-200">
          <Dialog.Title className="text-lg font-bold text-neutral-900 flex items-center gap-2 mb-2">
            <AlertTriangle className="text-amber-500" size={20} />
            This presentation already contains content
          </Dialog.Title>
          <Dialog.Description className="text-sm text-neutral-500 mb-5">
            What would you like to do?
          </Dialog.Description>

          <div className="space-y-3">
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setChoice(opt.value)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  choice === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span
                  className={`mt-0.5 w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    choice === opt.value ? 'border-primary' : 'border-neutral-300'
                  }`}
                >
                  {choice === opt.value && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold text-neutral-900">{opt.label}</span>
                  <span className="block text-xs text-neutral-500 mt-0.5">{opt.description}</span>
                </span>
                {choice === opt.value && <Check className="text-primary shrink-0" size={16} />}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={() => resolveTemplateConflict('keep')}
              className="h-10 px-4 rounded-lg text-sm font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => resolveTemplateConflict(choice)}
              className="h-10 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Continue
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TemplateConflictDialog;
