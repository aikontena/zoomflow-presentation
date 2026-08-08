import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { IconMeta } from '@/lib/icon-registry';
import { IconRenderer } from '../IconRenderer';

interface IconGridProps {
  icons: IconMeta[];
  favorites: string[];
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  /** How many to render initially / per page (lazy windowing). */
  pageSize?: number;
}

export const IconCard: React.FC<{
  icon: IconMeta;
  isFavorite: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}> = React.memo(({ icon, isFavorite, onSelect, onToggleFavorite }) => (
  <div
    role="button"
    tabIndex={0}
    title={icon.label}
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData('iconName', icon.id);
      e.dataTransfer.setData('text/plain', icon.id);
      e.dataTransfer.effectAllowed = 'copy';
    }}
    onClick={() => onSelect(icon.id)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(icon.id);
      }
    }}
    className="group relative aspect-square rounded-lg border border-neutral-100 flex flex-col items-center justify-center p-1.5 hover:border-primary hover:bg-primary/5 cursor-grab active:cursor-grabbing transition-all active:scale-95"
  >
    <IconRenderer name={icon.id} size={22} className="text-neutral-700 group-hover:text-primary" />
    <span className="text-[8px] mt-1 text-neutral-400 group-hover:text-primary truncate w-full text-center leading-tight">
      {icon.id}
    </span>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite(icon.id);
      }}
      aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
      className={`absolute top-0.5 right-0.5 p-1 rounded-full bg-white shadow-sm border border-neutral-100 transition-opacity ${
        isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}
    >
      <Heart className={`w-2.5 h-2.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
    </button>
  </div>
));
IconCard.displayName = 'IconCard';

export const IconGrid: React.FC<IconGridProps> = ({
  icons,
  favorites,
  onSelect,
  onToggleFavorite,
  pageSize = 120,
}) => {
  const [visible, setVisible] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(pageSize);
  }, [icons, pageSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible((v) => (v >= icons.length ? v : v + pageSize));
      }
    }, { rootMargin: '200px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [icons.length, pageSize]);

  const slice = useMemo(() => icons.slice(0, visible), [icons, visible]);
  const favSet = useMemo(() => new Set(favorites), [favorites]);

  if (icons.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-neutral-400">No icons found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {slice.map((icon) => (
          <IconCard
            key={icon.id}
            icon={icon}
            isFavorite={favSet.has(icon.id)}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      {visible < icons.length && (
        <div ref={sentinelRef} className="py-4 text-center text-[10px] text-neutral-300">
          Loading more icons…
        </div>
      )}
    </>
  );
};

export default IconGrid;
