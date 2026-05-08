import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BarChart3, LayoutDashboard, RefreshCcw, ShieldCheck, Users } from 'lucide-react';
import { ROLES } from '../../lib/constants';
import { useData } from '../../app/DataContext';
import { Badge, Button, Select } from '../ui';

export function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole, dataMode, resetMockData } = useData();
  const location = useLocation();

  // Клиентская версия отчета должна открываться без внутреннего интерфейса команды.
  if (location.pathname.includes('/report')) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 lg:p-8">
        {children}
      </main>
    );
  }

  const navItem = 'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition';

  return (
    <div className="min-h-screen lg:flex">
      <aside className="no-print border-b border-slate-200 bg-white/90 p-4 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
        <Link to="/" className="mb-6 flex items-center gap-3">
          <img src="/logo-placeholder.svg" alt="EastSide" className="h-12 w-auto" />
        </Link>

        <nav className="grid gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navItem} ${isActive ? 'bg-eastside-navy text-white' : 'text-slate-600 hover:bg-slate-100'}`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Диагностики
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `${navItem} ${isActive ? 'bg-eastside-navy text-white' : 'text-slate-600 hover:bg-slate-100'}`
            }
          >
            <BarChart3 className="h-4 w-4" />
            Аналитика
          </NavLink>

          <div className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500">
            <Users className="mr-3 inline h-4 w-4" />
            Роль и режим
          </div>
        </nav>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Текущая роль
          </label>
          <Select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            Доступ блоков меняется по роли.
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Data mode</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Badge tone={dataMode === 'supabase' ? 'green' : 'yellow'}>
              {dataMode}
            </Badge>
            <Button variant="ghost" className="px-2" onClick={resetMockData}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="w-full p-4 lg:ml-72 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {location.pathname !== '/' && (
            <Link to="/" className="no-print mb-4 inline-flex text-sm font-semibold text-eastside-blue">
              ← Назад к списку
            </Link>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
