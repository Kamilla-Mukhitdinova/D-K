import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, Wish, Owner, DailyWishMessage } from './types';

interface AppState {
  activeUser: Owner;
  setActiveUser: (user: Owner) => void;
  tasks: Task[];
  wishes: Wish[];
  categories: string[];
  wishCategories: string[];
  dailyWishes: DailyWishMessage[];
  customHadiths: string[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addWish: (wish: Omit<Wish, 'id' | 'createdAt'>) => void;
  updateWish: (id: string, updates: Partial<Wish>) => void;
  deleteWish: (id: string) => void;
  addCategory: (category: string) => void;
  addWishCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  deleteWishCategory: (category: string) => void;
  addDailyWish: (wish: Omit<DailyWishMessage, 'id' | 'createdAt'>) => void;
  addCustomHadith: (hadith: string) => void;
  deleteCustomHadith: (hadith: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEYS = {
  tasks: 'twp-tasks',
  wishes: 'twp-wishes',
  activeUser: 'twp-active-user',
  categories: 'twp-categories',
  wishCategories: 'twp-wish-categories',
  dailyWishes: 'twp-daily-wishes',
  customHadiths: 'twp-custom-hadiths',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeUser, setActiveUser] = useState<Owner>(
    () => loadFromStorage<Owner>(STORAGE_KEYS.activeUser, 'Kamilla')
  );
  const [tasks, setTasks] = useState<Task[]>(
    () => loadFromStorage<Task[]>(STORAGE_KEYS.tasks, [])
  );
  const [wishes, setWishes] = useState<Wish[]>(
    () => loadFromStorage<Wish[]>(STORAGE_KEYS.wishes, [])
  );
  const [categories, setCategories] = useState<string[]>(
    () => loadFromStorage<string[]>(STORAGE_KEYS.categories, ['Home', 'Work'])
  );
  const [wishCategories, setWishCategories] = useState<string[]>(
    () => loadFromStorage<string[]>(STORAGE_KEYS.wishCategories, ['Путешествия', 'Покупки', 'Опыт'])
  );
  const [dailyWishes, setDailyWishes] = useState<DailyWishMessage[]>(
    () => loadFromStorage<DailyWishMessage[]>(STORAGE_KEYS.dailyWishes, [])
  );
  const [customHadiths, setCustomHadiths] = useState<string[]>(
    () => loadFromStorage<string[]>(STORAGE_KEYS.customHadiths, [])
  );

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.wishes, JSON.stringify(wishes)); }, [wishes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.activeUser, JSON.stringify(activeUser)); }, [activeUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.wishCategories, JSON.stringify(wishCategories)); }, [wishCategories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.dailyWishes, JSON.stringify(dailyWishes)); }, [dailyWishes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.customHadiths, JSON.stringify(customHadiths)); }, [customHadiths]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    setTasks(prev => [...prev, { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, ...updates };
      if (updates.status === 'done' && t.status !== 'done') {
        updated.completedAt = new Date().toISOString();
      }
      if (updates.status && updates.status !== 'done') {
        updated.completedAt = undefined;
      }
      return updated;
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addWish = useCallback((wish: Omit<Wish, 'id' | 'createdAt'>) => {
    setWishes(prev => [...prev, { ...wish, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
  }, []);

  const updateWish = useCallback((id: string, updates: Partial<Wish>) => {
    setWishes(prev => prev.map(w => {
      if (w.id !== id) return w;
      const updated = { ...w, ...updates };
      if (updates.status === 'achieved' && w.status !== 'achieved') {
        updated.achievedAt = new Date().toISOString();
      }
      return updated;
    }));
  }, []);

  const deleteWish = useCallback((id: string) => {
    setWishes(prev => prev.filter(w => w.id !== id));
  }, []);

  const addCategory = useCallback((category: string) => {
    setCategories(prev => prev.includes(category) ? prev : [...prev, category]);
  }, []);

  const addWishCategory = useCallback((category: string) => {
    setWishCategories(prev => prev.includes(category) ? prev : [...prev, category]);
  }, []);

  const deleteCategory = useCallback((category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  }, []);

  const deleteWishCategory = useCallback((category: string) => {
    setWishCategories(prev => prev.filter(c => c !== category));
  }, []);

  const addDailyWish = useCallback((wish: Omit<DailyWishMessage, 'id' | 'createdAt'>) => {
    setDailyWishes(prev => [...prev, { ...wish, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
  }, []);

  const addCustomHadith = useCallback((hadith: string) => {
    setCustomHadiths(prev => prev.includes(hadith) ? prev : [...prev, hadith]);
  }, []);

  const deleteCustomHadith = useCallback((hadith: string) => {
    setCustomHadiths(prev => prev.filter(h => h !== hadith));
  }, []);

  return (
    <AppContext.Provider value={{
      activeUser, setActiveUser,
      tasks, wishes, categories, wishCategories,
      dailyWishes, customHadiths,
      addTask, updateTask, deleteTask,
      addWish, updateWish, deleteWish,
      addCategory, addWishCategory,
      deleteCategory, deleteWishCategory,
      addDailyWish, addCustomHadith, deleteCustomHadith,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
