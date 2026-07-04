import Link from 'next/link';
import { Users, LayoutDashboard, ClipboardList, Bell } from 'lucide-react';

const NAV = [
  { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Painel' },
  { href: '/teacher/students', icon: Users,            label: 'Alunos' },
  { href: '/teacher/review',   icon: ClipboardList,    label: 'Avaliar' },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white text-sm font-bold">ح</div>
            <span className="text-sm font-semibold text-text-primary">Professor</span>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-text-secondary" aria-label="Alertas">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-around">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-1 px-4 py-3 text-text-muted hover:text-accent transition-colors">
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
