import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { getIconMeta } from '@/lib/icon-registry';
import { IconCard } from './IconGrid';

interface Props {
  favorites: string[];
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const FavoriteIcons: React.FC<Props> = ({ favorites, onSelect, onToggleFavorite }) => {
  const icons = useMemo(
    () => favorites.map(getIconMeta).filter(Boolean) as NonNullable<ReturnType<typeof getIconMeta>>[],
    [favorites],
  );
  if (icons.length === 0) return null;

  return (
    <section>
      <h3 className="text-[10px] font-semibold text-neutral-500 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
        <Heart className="w-3 h-3 text-red-500" />
        Favorites
      </h3>
      <div className="grid grid-cols-4 gap-2">
        {icons.map((icon) => (
          <IconCard
            key={`fav-${icon.id}`}
            icon={icon}
            isFavorite
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
};

export default FavoriteIcons;
