import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Check, Layout } from 'lucide-react';
import { useCanvasStore } from '@/lib/canvas-store';

type Choice = 'keep' | 'new' | 'duplicate' | 'replace';

const OPTIONS: { value: Choice; label: string; description: string; danger?: boolean }[] = [
  {
    value: 'new',
    label: 'Create New Presentation (Recommended)',
    description: 'Your current presentation is kept as a saved copy, and a fresh one is built from this template.',
  },
  {
    value: 'duplicate',
    label: 'Duplicate Current Presentation and Apply Template',
    description: 'Saves a duplicate of the current presentation first, then applies the template.',
  },
  {
    value: 'replace',
    label: 'Replace Current Presentation',
    description: 'This will remove the current presentation.',
    danger: true,
  },
];

export const TemplateConflictDialog: React.FC = () => {
  const pendingTemplate = useCanvasStore((s) => s.pendingTemplate);
  const resolveTemplateConflict = useCanvasStore((s) => s.resolveTemplateConflict);
  const [choice, setChoice] = React.useState<Choice>('new');

  React.useEffect(() => {
    if (pendingTemplate) setChoice('new');
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
            <Layout className="text-primary" size={20} />
            Choose how to use this template
          </Dialog.Title>
          <Dialog.Description className="text-sm text-neutral-500 mb-5">
            Your existing presentation will not be changed unless you choose to replace it.
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
                  <span className={`flex items-start gap-1.5 text-xs mt-0.5 ${opt.danger ? 'text-amber-600 font-medium' : 'text-neutral-500'}`}>
                    {opt.danger && <AlertTriangle className="shrink-0 mt-[1px]" size={12} />}
                    {opt.description}
                  </span>
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
              className={`h-10 px-5 rounded-lg text-white ${choice === 'replace' ? 'bg-amber-600 hover:bg-amber-600/90 shadow-amber-600/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`.concat("  text-sm font-bold transition-colors shadow-lg")}
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
