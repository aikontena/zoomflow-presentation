import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { getIconMeta } from '@/lib/icon-registry';
import { IconCard } from './IconGrid';

interface Props {
  recent: string[];
  favorites: string[];
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClear: () => void;
}

export const RecentIcons: React.FC<Props> = ({ recent, favorites, onSelect, onToggleFavorite, onClear }) => {
  const icons = useMemo(() => recent.map(getIconMeta).filter(Boolean).slice(0, 8) as NonNullable<ReturnType<typeof getIconMeta>>[], [recent]);
  if (icons.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-semibold text-neutral-500 flex items-center gap-1.5 uppercase tracking-wider">
          <Clock className="w-3 h-3" />
          Recently Used
        </h3>
        <button onClick={onClear} className="text-[10px] text-neutral-400 hover:text-neutral-600">
          Clear
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {icons.map((icon) => (
          <IconCard
            key={`recent-${icon.id}`}
            icon={icon}
            isFavorite={favorites.includes(icon.id)}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
};

export default RecentIcons;
