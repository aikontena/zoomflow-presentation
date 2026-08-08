import { useCallback } from 'react';
import { useCanvasStore } from '@/lib/canvas-store';
import { useIconPrefs } from '@/lib/icon-prefs';
import { getIconMeta } from '@/lib/icon-registry';
import { toast } from 'sonner';

export const DEFAULT_ICON_SIZE = 48;

/**
 * IconManager — the single place that knows how an icon becomes a canvas object.
 * The library UI never touches the store directly.
 */
export function useIconManager() {
  const addObject = useCanvasStore((s) => s.addObject);
  const updateObject = useCanvasStore((s) => s.updateObject);
  const setSelection = useCanvasStore((s) => s.setSelection);
  const { pushRecent } = useIconPrefs();

  const insertIcon = useCallback(
    (iconId: string, at?: { x: number; y: number }) => {
      const meta = getIconMeta(iconId);
      if (!meta) {
        toast.error('Unknown icon');
        return null;
      }
      const viewport = useCanvasStore.getState().viewport;
      const zoom = viewport.zoom || 1;
      const center = at ?? {
        x: (window.innerWidth / 2 - viewport.x) / zoom,
        y: (window.innerHeight / 2 - viewport.y) / zoom,
      };
      const id = addObject({
        type: 'icon',
        iconName: meta.id,
        x: Math.round(center.x - DEFAULT_ICON_SIZE / 2),
        y: Math.round(center.y - DEFAULT_ICON_SIZE / 2),
        width: DEFAULT_ICON_SIZE,
        height: DEFAULT_ICON_SIZE,
        rotation: 0,
        fill: '#3b82f6',
        strokeWidth: 2,
        opacity: 1,
      });
      setSelection([id]);
      pushRecent(meta.id);
      return id;
    },
    [addObject, setSelection, pushRecent],
  );

  const replaceIcon = useCallback(
    (objectId: string, iconId: string) => {
      const meta = getIconMeta(iconId);
      if (!meta) return;
      updateObject(objectId, { iconName: meta.id });
      pushRecent(meta.id);
    },
    [updateObject, pushRecent],
  );

  /** Click behaviour: replace when a single icon object is selected, otherwise insert. */
  const insertOrReplace = useCallback(
    (iconId: string) => {
      const { selection, objects } = useCanvasStore.getState();
      const target = selection.length === 1 ? objects.find((o) => o.id === selection[0]) : undefined;
      if (target && target.type === 'icon') {
        replaceIcon(target.id, iconId);
        toast.success('Icon replaced');
        return target.id;
      }
      const id = insertIcon(iconId);
      if (id) toast.success('Icon added to canvas');
      return id;
    },
    [insertIcon, replaceIcon],
  );

  return { insertIcon, replaceIcon, insertOrReplace };
}
