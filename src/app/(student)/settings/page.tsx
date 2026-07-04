'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Bell, BookOpen, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState(true);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-text-primary">Configurações</h1>

      {/* Appearance */}
      <Card>
        <CardHeader><CardTitle>Aparência</CardTitle></CardHeader>
        <CardContent>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-xl bg-surface-alt px-4 py-3 transition-colors hover:bg-border"
          >
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="h-4 w-4 text-gold" /> : <Moon className="h-4 w-4 text-accent" />}
              <span className="text-sm font-medium text-text-primary">
                {theme === 'light' ? 'Tema claro' : 'Tema escuro'}
              </span>
            </div>
            <span className="text-xs text-text-muted">Alternar</span>
          </button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle>Notificações</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">Lembretes diários</span>
            </div>
            <button
              onClick={() => setNotifications((n) => !n)}
              className={`relative h-6 w-11 rounded-full transition-colors ${notifications ? 'bg-accent' : 'bg-border'}`}
              role="switch"
              aria-checked={notifications}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader><CardTitle>Plano de Hifdh</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          <button className="flex w-full items-center gap-3 rounded-xl bg-surface-alt px-4 py-3 text-left transition-colors hover:bg-border">
            <BookOpen className="h-4 w-4 text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">Ajustar ritmo diário</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl bg-surface-alt px-4 py-3 text-left transition-colors hover:bg-border">
            <BookOpen className="h-4 w-4 text-text-secondary" />
            <span className="text-sm font-medium text-text-primary">Dias de estudo</span>
          </button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full border-day-missed text-day-missed hover:bg-day-missed/10"
        onClick={() => { document.cookie = 'session=; Max-Age=0'; window.location.href = '/login'; }}
      >
        <LogOut className="h-4 w-4" /> Sair da conta
      </Button>

      <p className="text-center text-xs text-text-muted">Hifdh Companion v1.0.0</p>
    </div>
  );
}
