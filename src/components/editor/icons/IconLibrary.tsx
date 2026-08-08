import React, { useDeferredValue, useMemo, useState } from 'react';
import { Grid } from 'lucide-react';
import { IconCategory, searchIcons, ICON_COUNT } from '@/lib/icon-registry';
import { useIconPrefs } from '@/lib/icon-prefs';
import { useIconManager } from './IconManager';
import { IconSearch } from './IconSearch';
import { IconGrid } from './IconGrid';
import { RecentIcons } from './RecentIcons';
import { FavoriteIcons } from './FavoriteIcons';

export const IconLibrary: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<IconCategory | 'All'>('All');
  const deferredQuery = useDeferredValue(query);

  const { favorites, recent, toggleFavorite, pushRecent, clearRecent } = useIconPrefs();
  const { insertOrReplace } = useIconManager();

  const results = useMemo(() => searchIcons(deferredQuery, category), [deferredQuery, category]);

  const handleSelect = (id: string) => {
    insertOrReplace(id);
    pushRecent(id);
  };

  const showShortcuts = deferredQuery === '' && category === 'All';

  return (
    <div className="flex flex-col h-full w-full bg-white -m-4">
      <div className="p-4 border-b border-neutral-100 space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2 text-neutral-900">
          <Grid className="w-4 h-4 text-primary" />
          Icon Library
          <span className="ml-auto text-[10px] font-normal text-neutral-400">{ICON_COUNT} Lucide icons</span>
        </h2>
        <IconSearch
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          resultCount={results.length}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {showShortcuts && (
          <>
            <RecentIcons
              recent={recent}
              favorites={favorites}
              onSelect={handleSelect}
              onToggleFavorite={toggleFavorite}
              onClear={clearRecent}
            />
            <FavoriteIcons favorites={favorites} onSelect={handleSelect} onToggleFavorite={toggleFavorite} />
          </>
        )}

        <section>
          <h3 className="text-[10px] font-semibold text-neutral-500 mb-2 uppercase tracking-wider">
            {deferredQuery ? 'Search Results' : category === 'All' ? 'All Icons' : category}
          </h3>
          <IconGrid
            icons={results}
            favorites={favorites}
            onSelect={handleSelect}
            onToggleFavorite={toggleFavorite}
          />
        </section>

        <p className="text-[10px] text-neutral-400 text-center pt-2">
          Click to insert · Drag onto the canvas · Select an icon then click to replace
        </p>
      </div>
    </div>
  );
};

export default IconLibrary;
