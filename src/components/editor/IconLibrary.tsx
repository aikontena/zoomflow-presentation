import React, { useState, useMemo, useEffect } from 'react';
import { Search, Heart, Clock, Grid, List, Plus } from 'lucide-react';
import { ICONS, ICON_CATEGORIES, IconMetadata, IconCategory } from '@/lib/icons';
import { IconRenderer } from './IconRenderer';
import { useCanvasStore } from '@/lib/canvas-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const IconLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IconCategory | 'All'>('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  
  const addObject = useCanvasStore(state => state.addObject);

  // Load favorites and recent from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('zoomcanvas-favorite-icons');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    
    const savedRecent = localStorage.getItem('zoomcanvas-recent-icons');
    if (savedRecent) setRecent(JSON.parse(savedRecent));
  }, []);

  const toggleFavorite = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(name) 
      ? favorites.filter(f => f !== name) 
      : [...favorites, name];
    setFavorites(newFavorites);
    localStorage.setItem('zoomcanvas-favorite-icons', JSON.stringify(newFavorites));
    toast.success(favorites.includes(name) ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleAddIcon = (name: string) => {
    addObject({
      type: 'icon',
      iconName: name,
      x: 100,
      y: 100,
      width: 48,
      height: 48,
      rotation: 0,
      fill: '#3b82f6',
      opacity: 1
    });

    // Update recent
    const newRecent = [name, ...recent.filter(r => r !== name)].slice(0, 20);
    setRecent(newRecent);
    localStorage.setItem('zoomcanvas-recent-icons', JSON.stringify(newRecent));
    toast.success('Icon added to canvas');
  };

  const filteredIcons = useMemo(() => {
    return ICONS.filter(icon => {
      const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           icon.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || icon.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const recentIcons = useMemo(() => {
    return ICONS.filter(icon => recent.includes(icon.name));
  }, [recent]);

  const favoriteIcons = useMemo(() => {
    return ICONS.filter(icon => favorites.includes(icon.name));
  }, [favorites]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200 w-80">
      <div className="p-4 border-b border-neutral-100 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Grid className="w-5 h-5 text-primary" />
          Icon Library
        </h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input 
            placeholder="Search icons..." 
            className="pl-9 bg-neutral-50 border-none h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button 
            variant={selectedCategory === 'All' ? 'default' : 'secondary'} 
            size="sm" 
            className="h-7 text-[10px] px-2"
            onClick={() => setSelectedCategory('All')}
          >
            All
          </Button>
          {ICON_CATEGORIES.map(cat => (
            <Button 
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'secondary'} 
              size="sm" 
              className="h-7 text-[10px] px-2 whitespace-nowrap"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {recentIcons.length > 0 && searchQuery === '' && selectedCategory === 'All' && (
            <section>
              <h3 className="text-xs font-semibold text-neutral-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                Recently Used
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {recentIcons.map(icon => (
                  <IconCard 
                    key={`recent-${icon.name}`} 
                    icon={icon} 
                    isFavorite={favorites.includes(icon.name)}
                    onAdd={() => handleAddIcon(icon.name)}
                    onFavorite={(e) => toggleFavorite(icon.name, e)}
                  />
                ))}
              </div>
            </section>
          )}

          {favoriteIcons.length > 0 && searchQuery === '' && selectedCategory === 'All' && (
            <section>
              <h3 className="text-xs font-semibold text-neutral-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Heart className="w-3 h-3 text-red-500" />
                Favorites
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {favoriteIcons.map(icon => (
                  <IconCard 
                    key={`fav-${icon.name}`} 
                    icon={icon} 
                    isFavorite={true}
                    onAdd={() => handleAddIcon(icon.name)}
                    onFavorite={(e) => toggleFavorite(icon.name, e)}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold text-neutral-500 mb-3 uppercase tracking-wider">
              {searchQuery ? 'Search Results' : (selectedCategory === 'All' ? 'All Icons' : selectedCategory)}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {filteredIcons.map(icon => (
                <IconCard 
                  key={icon.name} 
                  icon={icon} 
                  isFavorite={favorites.includes(icon.name)}
                  onAdd={() => handleAddIcon(icon.name)}
                  onFavorite={(e) => toggleFavorite(icon.name, e)}
                />
              ))}
            </div>
            {filteredIcons.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-neutral-400">No icons found</p>
              </div>
            )}
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

interface IconCardProps {
  icon: IconMetadata;
  isFavorite: boolean;
  onAdd: () => void;
  onFavorite: (e: React.MouseEvent) => void;
}

const IconCard: React.FC<IconCardProps> = ({ icon, isFavorite, onAdd, onFavorite }) => {
  return (
    <div 
      className="group relative aspect-square rounded-lg border border-neutral-100 flex flex-col items-center justify-center p-2 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all active:scale-95"
      onClick={onAdd}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('iconName', icon.name);
      }}
    >
      <IconRenderer name={icon.name} size={24} className="text-neutral-700 group-hover:text-primary" />
      <span className="text-[8px] mt-1 text-neutral-400 group-hover:text-primary truncate w-full text-center">
        {icon.name}
      </span>
      
      <button 
        onClick={onFavorite}
        className={`absolute top-1 right-1 p-1 rounded-full bg-white shadow-sm border border-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity ${isFavorite ? 'opacity-100' : ''}`}
      >
        <Heart className={`w-2.5 h-2.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
      </button>
    </div>
  );
};
