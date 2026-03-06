import { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Task } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function EditTaskDialog({ task, open, onClose }: { task: Task | null; open: boolean; onClose: () => void }) {
  const { updateTask, categories } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDateTime, setDueDateTime] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategory(task.category);
      setDueDateTime(task.dueDateTime || '');
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !title.trim()) return;
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      dueDateTime: dueDateTime || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Редактировать задачу</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Название *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <Label>Описание</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>
          <div>
            <Label>Категория</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c === 'Home' ? 'Дом' : c === 'Work' ? 'Работа' : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Дедлайн</Label>
            <Input type="datetime-local" value={dueDateTime} onChange={e => setDueDateTime(e.target.value)} />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Сохранить
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
