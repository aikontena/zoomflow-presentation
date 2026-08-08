import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  Filter, 
  Star, 
  ExternalLink, 
  Plus, 
  MoreVertical,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Layout,
  Sparkles,
  X
} from 'lucide-react';
import { TEMPLATES, Template } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useCanvasStore } from '@/lib/canvas-store';
import { toast } from 'sonner';

interface TemplateCardProps {
  template: Template;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  isFavorite: boolean;
  onClick: () => void;
  onFavorite: (e: React.MouseEvent) => void;
}

function TemplateCard({ template, viewMode, isSelected, isFavorite, onClick, onFavorite }: TemplateCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`group cursor-pointer transition-all ${
        viewMode === 'grid' 
          ? 'flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1' 
          : 'flex items-center gap-4 p-3 bg-white border border-neutral-100 rounded-lg hover:border-primary'
      } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      <div className={`relative bg-neutral-100 overflow-hidden ${viewMode === 'grid' ? 'aspect-video' : 'w-32 aspect-video rounded-md shrink-0'}`}>
        <img 
          src={template.thumbnail} 
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Button 
            variant="secondary" 
            size="sm" 
            className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all shadow-lg"
          >
            Quick View
          </Button>
        </div>
        <button 
          onClick={onFavorite}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${
            isFavorite 
              ? 'bg-yellow-400 text-white' 
              : 'bg-white/80 text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-yellow-500'
          }`}
        >
          <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-neutral-900 leading-tight truncate">{template.name}</h3>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 shrink-0">
            {template.difficulty}
          </Badge>
        </div>
        <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
          {template.description}
        </p>
        <div className="mt-auto pt-3 flex items-center gap-4 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1">
            <Layout size={12} />
            {template.framesCount} Frames
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {template.estimatedDuration}m
          </div>
          {viewMode === 'grid' && (
            <div className="flex items-center gap-1 ml-auto">
              <TrendingUp size={12} />
              {template.popularity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TemplateLibrary() {
  const { setActiveOverlay, loadTemplate } = useCanvasStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(TEMPLATES[0] || null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = useMemo(() => {
    const cats = new Set(TEMPLATES.map(t => t.category));
    return ['All', ...Array.from(cats)].sort();
  }, []);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Left Column: Library */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-neutral-200">
        {/* Header: Controls */}
        <div className="p-4 border-b border-neutral-100 bg-neutral-50/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <Input 
                placeholder="Search templates..." 
                className="pl-10 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Recently Added</DropdownMenuItem>
                <DropdownMenuItem>Most Popular</DropdownMenuItem>
                <DropdownMenuItem>Alphabetical</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex border border-neutral-200 rounded-md overflow-hidden bg-white">
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="rounded-none h-9 w-9"
                onClick={() => setViewMode('grid')}
              >
                <Grid size={16} />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="icon" 
                className="rounded-none h-9 w-9"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>

          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex gap-2">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full px-4"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Content: Template Grid */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* Favorites Section */}
            {favorites.length > 0 && searchQuery === '' && activeCategory === 'All' && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-neutral-900">
                  <Star size={18} className="text-yellow-400 fill-current" />
                  <h2 className="text-lg font-bold">Your Favorites</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {TEMPLATES.filter(t => favorites.includes(t.id)).map(template => (
                    <TemplateCard 
                      key={template.id} 
                      template={template} 
                      viewMode={viewMode}
                      isSelected={selectedTemplate?.id === template.id}
                      isFavorite={true}
                      onClick={() => setSelectedTemplate(template)}
                      onFavorite={(e) => toggleFavorite(e, template.id)}
                    />
                  ))}
                </div>
                <Separator />
              </section>
            )}

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900">
                  {activeCategory === 'All' ? 'All Templates' : `${activeCategory} Templates`}
                </h2>
                <span className="text-xs text-neutral-400 font-medium">
                  Showing {filteredTemplates.length} results
                </span>
              </div>
              
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-3'}>
                {filteredTemplates.map(template => (
                  <TemplateCard 
                    key={template.id} 
                    template={template} 
                    viewMode={viewMode}
                    isSelected={selectedTemplate?.id === template.id}
                    isFavorite={favorites.includes(template.id)}
                    onClick={() => setSelectedTemplate(template)}
                    onFavorite={(e) => toggleFavorite(e, template.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </div>

      {/* Right Column: Preview Panel */}
      {selectedTemplate && (
        <div className="w-80 flex flex-col bg-neutral-50/50 animate-in slide-in-from-right duration-300">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                <img src={selectedTemplate.thumbnail} alt="Preview" className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none">
                    {selectedTemplate.category}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-neutral-900 leading-tight">
                  {selectedTemplate.name}
                </h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {selectedTemplate.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-neutral-100 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Duration</span>
                  <span className="text-sm font-semibold">{selectedTemplate.estimatedDuration} mins</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-neutral-100 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Slides</span>
                  <span className="text-sm font-semibold">{selectedTemplate.framesCount} Frames</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Features Included</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Dynamic Zoom Paths', icon: TrendingUp },
                    { label: 'Vector Assets', icon: Layers },
                    { label: 'Responsive Layouts', icon: Layout },
                    { label: 'Animations', icon: Sparkles }
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-neutral-700">
                      <div className="w-6 h-6 rounded bg-primary/5 flex items-center justify-center text-primary">
                        <feat.icon size={14} />
                      </div>
                      {feat.label}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Primary Colors</h4>
                <div className="flex gap-2">
                  {['#3B82F6', '#1E293B', '#F1F5F9', '#FFFFFF'].map((color, i) => (
                    <div 
                      key={i} 
                      className="w-8 h-8 rounded-full border border-neutral-200 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 bg-white border-t border-neutral-200 space-y-3">
            <Button 
              onClick={() => {
                console.log("[UI] Template button clicked:", selectedTemplate.name);
                loadTemplate(selectedTemplate);
                setActiveOverlay(null);
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white h-11 text-lg font-medium shadow-lg shadow-primary/20 group"
            >
              Use Template
              <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-11 font-medium"
              onClick={() => {
                loadTemplate(selectedTemplate);
                toast.info(`Duplicated ${selectedTemplate.name} as draft`);
                setActiveOverlay(null);
              }}
            >
              Duplicate Template
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
