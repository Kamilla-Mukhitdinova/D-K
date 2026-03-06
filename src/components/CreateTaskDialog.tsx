import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function CreateTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activeUser, addTask, categories, addCategory } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Home');
  const [dueDateTime, setDueDateTime] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      status: 'todo',
      dueDateTime: dueDateTime || undefined,
      owner: activeUser,
    });
    setTitle('');
    setDescription('');
    setDueDateTime('');
    onClose();
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setCategory(newCategory.trim());
      setNewCategory('');
      setShowNewCat(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Новая задача</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Название *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Что нужно сделать?" autoFocus />
          </div>
          <div>
            <Label>Описание</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Подробности..." rows={2} />
          </div>
          <div>
            <Label>Категория</Label>
            {!showNewCat ? (
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c === 'Home' ? 'Дом' : c === 'Work' ? 'Работа' : c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button type="button" onClick={() => setShowNewCat(true)} className="shrink-0 rounded-lg border px-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  +
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Название категории" />
                <button type="button" onClick={handleAddCategory} className="shrink-0 rounded-lg bg-primary px-3 text-sm text-primary-foreground">
                  Добавить
                </button>
                <button type="button" onClick={() => setShowNewCat(false)} className="shrink-0 rounded-lg border px-3 text-sm text-muted-foreground">
                  ✕
                </button>
              </div>
            )}
          </div>
          <div>
            <Label>Дедлайн (необязательно)</Label>
            <Input type="datetime-local" value={dueDateTime} onChange={e => setDueDateTime(e.target.value)} />
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">Владелец: <strong>{activeUser}</strong></span>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Создать
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
