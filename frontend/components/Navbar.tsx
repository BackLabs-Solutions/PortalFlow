'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Settings, LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { clearToken } from '@/lib/auth';

const links = [
  { href: '/dashboard', label: 'Projets', icon: LayoutGrid },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearToken();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard">
          <Logo size={28} />
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-control px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-indigo/10 text-indigo' : 'text-slate hover:text-ink'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={logout}
            aria-label="Se déconnecter"
            className="flex h-9 w-9 items-center justify-center rounded-control border border-line text-slate transition-colors hover:text-danger"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
