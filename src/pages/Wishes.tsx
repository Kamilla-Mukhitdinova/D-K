import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Owner, ViewFilter } from '@/lib/types';
import { OwnerBadge } from '@/components/Badges';
import { CreateWishDialog } from '@/components/CreateWishDialog';
import { ManageCategoriesDialog } from '@/components/ManageCategoriesDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Trash2, Eye, Sparkles, Settings } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function Wishes() {
  const { wishes, activeUser, updateWish, deleteWish, wishCategories } = useApp();
  const [filter, setFilter] = useState<ViewFilter>('all');
  const [catFilter, setCatFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showCatManager, setShowCatManager] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filtered = wishes.filter(w => {
    if (filter === 'my') return w.owner === activeUser;
    if (filter === 'partner') return w.owner !== activeUser;
    if (catFilter !== 'all') {
      if (catFilter === '_none') return !w.category;
      if (w.category !== catFilter) return false;
    }
    return true;
  });

  const canEdit = (owner: Owner) => owner === activeUser;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Доска желаний</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Мечты и планы вместе</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCatManager(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Категории"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Новое желание</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex rounded-xl bg-secondary p-0.5">
          {[
            { value: 'all', label: 'Все' },
            { value: 'my', label: 'Мои' },
            { value: 'partner', label: 'Партнёр' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value as ViewFilter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === opt.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {wishCategories.length > 0 && (
          <div className="flex gap-1.5 flex-wrap chips-scroll overflow-x-auto">
            {[
              { value: 'all', label: 'Все' },
              ...wishCategories.map(c => ({ value: c, label: c })),
              { value: '_none', label: 'Без кат.' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setCatFilter(opt.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                  catFilter === opt.value
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-secondary text-muted-foreground border border-transparent hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gallery */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center ethno-watermark rounded-2xl border bg-card">
          <Sparkles className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Пока нет желаний</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Добавьте первое желание</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Добавить желание
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence>
            {filtered.map(wish => (
              <motion.div
                key={wish.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`break-inside-avoid rounded-2xl border overflow-hidden card-hover group ${
                  wish.status === 'achieved' ? 'bg-status-done-light/30' : 'bg-card'
                }`}
              >
                {/* Image */}
                {wish.imageUrl && (
                  <button
                    onClick={() => setLightboxImage(wish.imageUrl!)}
                    className="w-full cursor-zoom-in overflow-hidden"
                  >
                    <img
                      src={wish.imageUrl}
                      alt={wish.title}
                      className="w-full object-cover hover:scale-105 transition-transform duration-300"
                      style={{ maxHeight: '280px' }}
                    />
                  </button>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Star className={`h-4 w-4 shrink-0 ${wish.status === 'achieved' ? 'text-status-done fill-status-done' : 'text-muted-foreground/40'}`} />
                      <span className={`text-sm font-medium truncate ${wish.status === 'achieved' ? 'line-through text-muted-foreground' : ''}`}>
                        {wish.title}
                      </span>
                    </div>
                    {!canEdit(wish.owner) && (
                      <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                  </div>

                  {wish.notes && (
                    <p className="text-xs text-muted-foreground mb-2 pl-6 line-clamp-2">{wish.notes}</p>
                  )}

                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <OwnerBadge owner={wish.owner} />
                    {wish.category && (
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        {wish.category}
                      </span>
                    )}
                  </div>

                  {canEdit(wish.owner) && (
                    <div className="flex items-center gap-1 mt-3 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                      {wish.status === 'planned' && (
                        <button
                          onClick={() => updateWish(wish.id, { status: 'achieved' })}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-status-done hover:bg-status-done-light transition-colors"
                        >
                          <Star className="h-3.5 w-3.5" />
                          Достигнуто
                        </button>
                      )}
                      <button
                        onClick={() => deleteWish(wish.id)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="sm:max-w-3xl p-1 bg-foreground/5 backdrop-blur-md border-none rounded-2xl">
          {lightboxImage && (
            <img src={lightboxImage} alt="Wish" className="w-full rounded-xl object-contain max-h-[80vh]" />
          )}
        </DialogContent>
      </Dialog>

      <CreateWishDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <ManageCategoriesDialog open={showCatManager} onClose={() => setShowCatManager(false)} type="wish" />
    </div>
  );
}
