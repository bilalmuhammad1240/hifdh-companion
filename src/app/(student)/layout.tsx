import Link from 'next/link';
import { LayoutDashboard, BookOpen, Map, BarChart2, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/today',     icon: BookOpen,        label: 'Hoje' },
  { href: '/mushaf',   icon: Map,             label: 'Mushaf' },
  { href: '/stats',    icon: BarChart2,        label: 'Stats' },
  { href: '/settings', icon: Settings,         label: 'Config' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white text-sm font-bold">
              ح
            </div>
            <span className="text-sm font-semibold text-text-primary">Hifdh Companion</span>
          </div>
          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-text-secondary hover:text-text-primary"
            aria-label="Configurações"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-6">{children}</main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-3 text-text-muted transition-colors hover:text-accent"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
