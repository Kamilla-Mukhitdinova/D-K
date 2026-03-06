import { useState, useMemo } from 'react';
import { useApp } from '@/lib/store';
import { Owner } from '@/lib/types';
import { motion } from 'framer-motion';
import {
  CheckCircle2, BookOpen, Heart, Plus, Pencil, Trash2, Send,
  TrendingUp, AlertTriangle, Calendar, Copy, Share2, Star
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

const DEFAULT_HADITHS = [
  'Лучший из вас тот, кто полезен для людей.',
  'Улыбка — это садака (милостыня).',
  'Сильный — не тот, кто побеждает других, а тот, кто владеет собой в гневе.',
  'Кто верит в Аллаха и в Последний день, пусть говорит благое или молчит.',
  'Ни один из вас не уверует, пока не полюбит для своего брата то, что любит для себя.',
  'Будь в этом мире как странник или путник.',
  'Чистота — половина веры.',
  'Тот, кто не благодарит людей, не благодарит Аллаха.',
  'Дела оцениваются по намерениям.',
  'Распространяйте мир между собой.',
  'Ищите знания от колыбели до могилы.',
  'Лучшая милостыня — накормить голодного.',
  'Кто идёт по пути знаний, тому Аллах облегчает путь в Рай.',
];

function getDailyIndex(arr: unknown[]) {
  const today = new Date();
  const day = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return day % arr.length;
}

export default function Dashboard() {
  const { tasks, activeUser, dailyWishes, addDailyWish, customHadiths, addCustomHadith, deleteCustomHadith, updateTask } = useApp();
  const [showWishDialog, setShowWishDialog] = useState(false);
  const [showHadithDialog, setShowHadithDialog] = useState(false);
  const [wishMessage, setWishMessage] = useState('');
  const [newHadith, setNewHadith] = useState('');

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;

  const kamillaTotal = tasks.filter(t => t.owner === 'Kamilla').length;
  const kamillaDone = tasks.filter(t => t.owner === 'Kamilla' && t.status === 'done').length;
  const doszhanTotal = tasks.filter(t => t.owner === 'Doszhan').length;
  const doszhanDone = tasks.filter(t => t.owner === 'Doszhan' && t.status === 'done').length;

  const kamillaPercent = kamillaTotal > 0 ? Math.round((kamillaDone / kamillaTotal) * 100) : 0;
  const doszhanPercent = doszhanTotal > 0 ? Math.round((doszhanDone / doszhanTotal) * 100) : 0;
  const totalPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Overdue tasks
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.dueDateTime && isBefore(new Date(t.dueDateTime), startOfDay(new Date())));

  // Today's tasks
  const myTodayTasks = tasks.filter(t => t.owner === activeUser && t.status !== 'done' && t.dueDateTime && isToday(new Date(t.dueDateTime))).slice(0, 3);
  const partner: Owner = activeUser === 'Kamilla' ? 'Doszhan' : 'Kamilla';
  const partnerTodayTasks = tasks.filter(t => t.owner === partner && t.status !== 'done' && t.dueDateTime && isToday(new Date(t.dueDateTime))).slice(0, 3);

  // Today done
  const todayDone = tasks.filter(t => t.status === 'done' && t.completedAt && isToday(new Date(t.completedAt))).length;
  const todayTotal = tasks.filter(t => t.dueDateTime && isToday(new Date(t.dueDateTime))).length;

  const allHadiths = [...DEFAULT_HADITHS, ...customHadiths];
  const hadith = allHadiths[getDailyIndex(allHadiths)];

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const wishForMe = dailyWishes
    .filter(w => w.to === activeUser && w.date === todayStr)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const myWishToPartner = dailyWishes
    .filter(w => w.from === activeUser && w.date === todayStr)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const handleSendWish = () => {
    if (!wishMessage.trim()) return;
    addDailyWish({ from: activeUser, to: partner, message: wishMessage.trim(), date: todayStr });
    setWishMessage('');
    setShowWishDialog(false);
    toast.success('Пожелание отправлено!');
  };

  const handleAddHadith = () => {
    if (!newHadith.trim()) return;
    addCustomHadith(newHadith.trim());
    setNewHadith('');
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано!');
  };

  const shareText = (text: string) => {
    if (navigator.share) {
      navigator.share({ text });
    } else {
      copyText(text);
    }
  };

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h2 className="font-display text-2xl font-bold">Сәлем, {activeUser}! 👋</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{format(new Date(), 'd MMMM, EEEE', { locale: ru })}</p>
      </motion.div>

      {/* Quick metrics */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Мой прогресс"
          value={`${activeUser === 'Kamilla' ? kamillaPercent : doszhanPercent}%`}
          sub={`${activeUser === 'Kamilla' ? kamillaDone : doszhanDone} из ${activeUser === 'Kamilla' ? kamillaTotal : doszhanTotal}`}
          icon={<TrendingUp className="h-4 w-4" />}
          color="text-primary"
          percent={activeUser === 'Kamilla' ? kamillaPercent : doszhanPercent}
          barColor="bg-primary"
        />
        <MetricCard
          label={`Прогресс ${partner}`}
          value={`${activeUser === 'Kamilla' ? doszhanPercent : kamillaPercent}%`}
          sub={`${activeUser === 'Kamilla' ? doszhanDone : kamillaDone} из ${activeUser === 'Kamilla' ? doszhanTotal : kamillaTotal}`}
          icon={<TrendingUp className="h-4 w-4" />}
          color="text-muted-foreground"
          percent={activeUser === 'Kamilla' ? doszhanPercent : kamillaPercent}
          barColor="bg-muted-foreground"
        />
        <MetricCard
          label="Сегодня"
          value={`${todayDone} из ${todayTotal}`}
          sub="выполнено"
          icon={<Calendar className="h-4 w-4" />}
          color="text-status-done"
        />
        <MetricCard
          label="Просрочено"
          value={`${overdueTasks.length}`}
          sub={overdueTasks.length > 0 ? 'требует внимания' : 'всё в порядке'}
          icon={<AlertTriangle className="h-4 w-4" />}
          color={overdueTasks.length > 0 ? 'text-destructive' : 'text-status-done'}
        />
      </motion.div>

      {/* Today's tasks */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TodayColumn
          title="Мои задачи"
          tasks={myTodayTasks}
          emptyText="Нет задач на сегодня"
          onComplete={(id) => updateTask(id, { status: 'done' })}
        />
        <TodayColumn
          title={`Задачи ${partner}`}
          tasks={partnerTodayTasks}
          emptyText="Нет задач на сегодня"
          readOnly
        />
      </motion.div>

      {/* Daily wish + Hadith */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wish from partner */}
        <div className="rounded-2xl border bg-card p-5 card-hover ethno-watermark overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-kamilla" />
            <span className="text-sm font-semibold">Пожелание от {partner}</span>
          </div>
          {wishForMe ? (
            <div className="quote-border pl-4">
              <p className="text-sm leading-relaxed italic text-foreground/80">«{wishForMe.message}»</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Пока нет пожелания на сегодня</p>
          )}
          <div className="mt-4 pt-3 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {myWishToPartner ? '✓ Вы уже отправили пожелание' : `Написать для ${partner}`}
            </span>
            <button
              onClick={() => setShowWishDialog(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              {myWishToPartner ? 'Ещё' : 'Написать'}
            </button>
          </div>
        </div>

        {/* Hadith of the day */}
        <div className="rounded-2xl border bg-card p-5 card-hover ethno-watermark overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">Хадис дня</span>
            </div>
            <button
              onClick={() => setShowHadithDialog(true)}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="quote-border pl-4">
            <p className="text-sm leading-relaxed italic text-foreground/80">
              «{hadith}»
            </p>
            <p className="text-xs text-muted-foreground mt-1 not-italic">— Пророк Мухаммад ﷺ</p>
          </div>
          <div className="flex items-center gap-1 mt-3 pt-3 border-t">
            <button onClick={() => copyText(hadith)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Copy className="h-3 w-3" /> Копировать
            </button>
            <button onClick={() => shareText(hadith)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Share2 className="h-3 w-3" /> Поделиться
            </button>
          </div>
        </div>
      </motion.div>

      {/* Wish dialog */}
      <Dialog open={showWishDialog} onOpenChange={setShowWishDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Пожелание для {partner}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={wishMessage}
              onChange={e => setWishMessage(e.target.value)}
              placeholder={`Напишите тёплые слова для ${partner}...`}
              rows={3}
              autoFocus
            />
            <div className="flex justify-end">
              <button
                onClick={handleSendWish}
                disabled={!wishMessage.trim()}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Отправить
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hadith dialog */}
      <Dialog open={showHadithDialog} onOpenChange={setShowHadithDialog}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Управление хадисами</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newHadith}
                onChange={e => setNewHadith(e.target.value)}
                placeholder="Добавить новый хадис..."
                onKeyDown={e => e.key === 'Enter' && handleAddHadith()}
              />
              <button
                onClick={handleAddHadith}
                disabled={!newHadith.trim()}
                className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {customHadiths.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-xs text-muted-foreground font-medium">Ваши хадисы:</p>
                {customHadiths.map((h, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 rounded-xl bg-secondary/50 px-3 py-2">
                    <span className="text-xs text-foreground/80 leading-relaxed">«{h}»</span>
                    <button
                      onClick={() => deleteCustomHadith(h)}
                      className="shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              + {DEFAULT_HADITHS.length} встроенных хадисов
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function MetricCard({ label, value, sub, icon, color, percent, barColor }: {
  label: string; value: string; sub: string; icon: React.ReactNode; color: string;
  percent?: number; barColor?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 card-hover">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold font-display">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      {percent !== undefined && barColor && (
        <div className="h-1.5 rounded-full bg-secondary mt-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${barColor}`}
          />
        </div>
      )}
    </div>
  );
}

function TodayColumn({ title, tasks, emptyText, readOnly, onComplete }: {
  title: string; tasks: { id: string; title: string; dueDateTime?: string }[];
  emptyText: string; readOnly?: boolean; onComplete?: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 card-hover">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{title}</span>
        <span className="ml-auto text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 px-3 py-2.5">
              {!readOnly && onComplete && (
                <button
                  onClick={() => onComplete(t.id)}
                  className="shrink-0 h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-status-done hover:bg-status-done-light transition-colors flex items-center justify-center"
                >
                  <CheckCircle2 className="h-3 w-3 text-transparent hover:text-status-done" />
                </button>
              )}
              <span className="text-sm truncate flex-1">{t.title}</span>
              {t.dueDateTime && (
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {format(new Date(t.dueDateTime), 'HH:mm')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
