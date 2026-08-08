import React from 'react';
import { Search, X } from 'lucide-react';
import { ICON_CATEGORIES, IconCategory } from '@/lib/icon-registry';

interface IconSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  category: IconCategory | 'All';
  onCategoryChange: (c: IconCategory | 'All') => void;
  resultCount: number;
}

export const IconSearch: React.FC<IconSearchProps> = ({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  resultCount,
}) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search icons..."
          className="w-full pl-9 pr-8 h-9 rounded-md bg-neutral-50 border border-neutral-200 text-sm outline-none focus:border-primary text-neutral-900"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-neutral-200 text-neutral-400"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {(['All', ...ICON_CATEGORIES] as (IconCategory | 'All')[]).map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`h-7 px-2 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
              category === cat
                ? 'bg-primary text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-neutral-400">{resultCount.toLocaleString()} icons</p>
    </div>
  );
};

export default IconSearch;
