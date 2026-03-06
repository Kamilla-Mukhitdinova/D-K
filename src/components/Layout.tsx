import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '@/lib/store';
import { LayoutDashboard, ListTodo, Heart, Plus, ChevronDown } from 'lucide-react';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { CreateWishDialog } from '@/components/CreateWishDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { activeUser, setActiveUser } = useApp();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateWish, setShowCreateWish] = useState(false);
  const location = useLocation();

  const avatarInitial = activeUser === 'Kamilla' ? 'К' : 'Д';
  const avatarBg = activeUser === 'Kamilla' ? 'bg-kamilla' : 'bg-doszhan';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/90 backdrop-blur-lg">
        <div className="ethno-line" />
        <div className="container flex h-14 items-center justify-between gap-4">
          {/* Logo + Nav */}
          <div className="flex items-center gap-6">
            <h1 className="font-display text-lg font-bold text-foreground tracking-tight whitespace-nowrap">
              Task & Wish
            </h1>
            <nav className="hidden sm:flex items-center gap-1">
              <NavTab to="/" label="Dashboard" icon={<LayoutDashboard className="h-4 w-4" />} />
              <NavTab to="/tasks" label="Задачи" icon={<ListTodo className="h-4 w-4" />} />
              <NavTab to="/wishes" label="Желания" icon={<Heart className="h-4 w-4" />} />
            </nav>
          </div>

          {/* Right: Quick action + Profile */}
          <div className="flex items-center gap-2">
            {/* Quick action "+" */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity">
                  <Plus className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setShowCreateTask(true)}>
                  <ListTodo className="h-4 w-4 mr-2" />
                  Новая задача
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCreateWish(true)}>
                  <Heart className="h-4 w-4 mr-2" />
                  Новое желание
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile pill */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border bg-card px-2 py-1 hover:bg-secondary transition-colors">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground ${avatarBg}`}>
                    {avatarInitial}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{activeUser}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setActiveUser('Kamilla')} className={activeUser === 'Kamilla' ? 'bg-kamilla-light' : ''}>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-kamilla text-[10px] font-bold text-primary-foreground mr-2">К</div>
                  Kamilla
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveUser('Doszhan')} className={activeUser === 'Doszhan' ? 'bg-doszhan-light' : ''}>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-doszhan text-[10px] font-bold text-primary-foreground mr-2">Д</div>
                  Doszhan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-lg safe-area-bottom">
        <div className="flex justify-around py-1.5">
          <MobileNavTab to="/" icon={<LayoutDashboard className="h-5 w-5" />} label="Главная" />
          <MobileNavTab to="/tasks" icon={<ListTodo className="h-5 w-5" />} label="Задачи" />
          <MobileNavTab to="/wishes" icon={<Heart className="h-5 w-5" />} label="Желания" />
        </div>
      </nav>

      <main className="container py-6 pb-24 sm:pb-8 max-w-5xl">
        {children}
      </main>

      <CreateTaskDialog open={showCreateTask} onClose={() => setShowCreateTask(false)} />
      <CreateWishDialog open={showCreateWish} onClose={() => setShowCreateWish(false)} />
    </div>
  );
}

function NavTab({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function MobileNavTab({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 px-4 py-1 text-[11px] font-medium transition-colors ${
          isActive ? 'text-primary' : 'text-muted-foreground'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
