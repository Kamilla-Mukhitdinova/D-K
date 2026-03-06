import { useState } from 'react';
import { useApp } from '@/lib/store';
import { ViewFilter, TaskStatus, Task } from '@/lib/types';
import { OwnerBadge, CategoryBadge, StatusBadge } from '@/components/Badges';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { EditTaskDialog } from '@/components/EditTaskDialog';
import { ManageCategoriesDialog } from '@/components/ManageCategoriesDialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, CheckCircle2, Clock, Trash2, ListTodo, Eye, Pencil,
  Settings, MoreHorizontal, Filter, ChevronDown, CalendarClock, AlertTriangle
} from 'lucide-react';
import { format, isToday, isThisWeek, isBefore, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type QuickFilter = 'all_time' | 'today' | 'week' | 'overdue';

export default function Tasks() {
  const { tasks, activeUser, updateTask, deleteTask, categories } = useApp();
  const [view, setView] = useState<ViewFilter>('all');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all_time');
  const [sortBy, setSortBy] = useState<'created' | 'due'>('created');
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCatManager, setShowCatManager] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  let filtered = tasks.filter(t => {
    if (view === 'my' && t.owner !== activeUser) return false;
    if (view === 'partner' && t.owner === activeUser) return false;
    if (catFilter !== 'all' && t.category !== catFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (quickFilter === 'today' && !(t.dueDateTime && isToday(new Date(t.dueDateTime)))) return false;
    if (quickFilter === 'week' && !(t.dueDateTime && isThisWeek(new Date(t.dueDateTime), { weekStartsOn: 1 }))) return false;
    if (quickFilter === 'overdue' && !(t.status !== 'done' && t.dueDateTime && isBefore(new Date(t.dueDateTime), startOfDay(new Date())))) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'due') {
      if (!a.dueDateTime) return 1;
      if (!b.dueDateTime) return -1;
      return new Date(a.dueDateTime).getTime() - new Date(b.dueDateTime).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const canEdit = (owner: string) => owner === activeUser;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Задачи</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} из {tasks.length}</p>
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
            <span className="hidden sm:inline">Новая задача</span>
          </button>
        </div>
      </div>

      {/* Segmented view control */}
      <div className="flex items-center gap-3 flex-wrap">
        <SegmentedControl
          value={view}
          onChange={(v) => setView(v as ViewFilter)}
          options={[
            { value: 'all', label: 'Все' },
            { value: 'my', label: 'Мои' },
            { value: 'partner', label: 'Партнёр' },
          ]}
        />

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Filter className="h-3.5 w-3.5" />
          Фильтры
          <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden sm:flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto">
              {sortBy === 'created' ? 'По дате' : 'По дедлайну'}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy('created')}>По дате создания</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('due')}>По дедлайну</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter chips — collapsible on mobile */}
      <div className={`flex flex-wrap gap-2 ${showFilters ? '' : 'hidden sm:flex'}`}>
        {/* Quick time filters */}
        <ChipGroup
          options={[
            { value: 'all_time', label: 'Все', icon: null },
            { value: 'today', label: 'Сегодня', icon: <CalendarClock className="h-3 w-3" /> },
            { value: 'week', label: 'Неделя', icon: null },
            { value: 'overdue', label: 'Просрочено', icon: <AlertTriangle className="h-3 w-3" /> },
          ]}
          value={quickFilter}
          onChange={(v) => setQuickFilter(v as QuickFilter)}
        />
        <div className="w-px h-6 bg-border self-center hidden sm:block" />
        {/* Category chips */}
        <ChipGroup
          options={[
            { value: 'all', label: 'Все кат.' },
            ...categories.map(c => ({ value: c, label: c === 'Home' ? 'Дом' : c === 'Work' ? 'Работа' : c })),
          ]}
          value={catFilter}
          onChange={setCatFilter}
        />
        <div className="w-px h-6 bg-border self-center hidden sm:block" />
        {/* Status chips */}
        <ChipGroup
          options={[
            { value: 'all', label: 'Все ст.' },
            { value: 'todo', label: 'К выполнению' },
            { value: 'in_progress', label: 'В процессе' },
            { value: 'done', label: 'Выполнено' },
          ]}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as 'all' | TaskStatus)}
        />

        {/* Mobile sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="sm:hidden flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Сорт: {sortBy === 'created' ? 'Дата' : 'Дедлайн'}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy('created')}>По дате</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('due')}>По дедлайну</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center ethno-watermark rounded-2xl border bg-card">
          <ListTodo className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Нет задач</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Создайте первую задачу</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Добавить задачу
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border bg-card p-4 card-hover group"
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  {canEdit(task.owner) && task.status !== 'done' ? (
                    <button
                      onClick={() => updateTask(task.id, { status: 'done' })}
                      className="mt-0.5 shrink-0 h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-status-done hover:bg-status-done-light transition-all flex items-center justify-center group/check"
                      title="Отметить выполненным"
                    >
                      <CheckCircle2 className="h-3 w-3 text-transparent group-hover/check:text-status-done transition-colors" />
                    </button>
                  ) : task.status === 'done' ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-status-done" />
                  ) : (
                    <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/20" />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      {!canEdit(task.owner) && (
                        <Eye className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <OwnerBadge owner={task.owner} />
                      <CategoryBadge category={task.category} />
                      <StatusBadge status={task.status} />
                      {task.dueDateTime && (
                        <span className={`inline-flex items-center gap-1 text-[11px] ${
                          task.status !== 'done' && isBefore(new Date(task.dueDateTime), new Date()) 
                            ? 'text-destructive font-medium' 
                            : 'text-muted-foreground'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {format(new Date(task.dueDateTime), 'd MMM, HH:mm', { locale: ru })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions menu */}
                  {canEdit(task.owner) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-secondary transition-all">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setEditingTask(task)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Редактировать
                        </DropdownMenuItem>
                        {task.status === 'todo' && (
                          <DropdownMenuItem onClick={() => updateTask(task.id, { status: 'in_progress' })}>
                            <Clock className="h-3.5 w-3.5 mr-2" /> В процессе
                          </DropdownMenuItem>
                        )}
                        {task.status !== 'done' && (
                          <DropdownMenuItem onClick={() => updateTask(task.id, { status: 'done' })}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Выполнено
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <CreateTaskDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <EditTaskDialog task={editingTask} open={!!editingTask} onClose={() => setEditingTask(null)} />
      <ManageCategoriesDialog open={showCatManager} onClose={() => setShowCatManager(false)} type="task" />
    </div>
  );
}

/* Segmented control for view */
function SegmentedControl({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex rounded-xl bg-secondary p-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            value === opt.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* Filter chip group */
function ChipGroup({ options, value, onChange }: {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap chips-scroll overflow-x-auto">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
            value === opt.value
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-secondary text-muted-foreground border border-transparent hover:text-foreground'
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
