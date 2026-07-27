import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { Menu, Sun, Moon, Plus, Download, LogOut, Check } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../lib/cn';

/** Multi-colour Google mark — kept as-is so the sign-in button is recognisable. */
const GoogleMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const AccountMenu: React.FC = () => {
  const { user, signOutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const name = user?.displayName || 'Your account';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2.5 h-11 pl-1.5 pr-2 sm:pr-3.5 rounded-xl border border-line-strong bg-surface hover:bg-sunken transition-colors"
      >
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="w-8 h-8 rounded-lg object-cover" />
        ) : (
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-tint text-brand font-semibold text-sm">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden sm:block max-w-[9rem] truncate text-[0.9375rem] font-medium">
          {name}
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 p-2 rounded-xl bg-surface border border-line shadow-[var(--shadow-overlay)] animate-fade-up z-50"
        >
          <div className="px-3 py-2.5">
            <p className="font-semibold truncate">{name}</p>
            {user?.email && <p className="text-sm text-ink-faint truncate">{user.email}</p>}
            <p className="mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-positive">
              <Check className="w-3.5 h-3.5" />
              Syncing to your account
            </p>
          </div>
          <div className="h-px bg-line my-1" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              void signOutUser();
            }}
            className="w-full flex items-center gap-2.5 px-3 h-11 rounded-lg text-[0.9375rem] font-medium text-ink-soft hover:bg-sunken hover:text-ink transition-colors"
          >
            <LogOut className="w-[1.125rem] h-[1.125rem]" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

interface TopbarProps {
  onOpenMobileNav: () => void;
  onOpenAddTx: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileNav, onOpenAddTx }) => {
  const { isGuest, signInWithGoogle } = useAuth();
  const { settings, updateSettings } = useFinance();
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstallPrompt(null);
  };

  const isDark = settings.theme === 'dark';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-[4.5rem] shrink-0 flex items-center gap-3 px-4 sm:px-6 lg:px-8',
        'bg-surface/85 backdrop-blur-md border-b border-line',
      )}
    >
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="lg:hidden grid place-items-center w-11 h-11 -ml-1 rounded-xl text-ink-soft hover:bg-sunken hover:text-ink transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Below `sm` the action buttons need the room, so only the mark shows. */}
      <div className="lg:hidden flex items-center gap-2.5 min-w-0">
        <span className="grid place-items-center w-9 h-9 rounded-lg bg-brand text-on-brand shrink-0">
          🐦
        </span>
        <span className="hidden sm:block font-display text-[1.25rem] leading-none truncate">
          Finance Pigeon
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-2.5">
        {installPrompt && (
          <Button
            onClick={handleInstall}
            icon={Download}
            className="hidden md:inline-flex"
            variant="ghost"
          >
            Install app
          </Button>
        )}

        <Button
          onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
          icon={isDark ? Sun : Moon}
          iconOnly
          variant="ghost"
        >
          {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        </Button>

        <Button onClick={onOpenAddTx} icon={Plus} variant="primary">
          <span className="hidden sm:inline">Add transaction</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {isGuest ? (
          <Button onClick={() => void signInWithGoogle()} icon={GoogleMark}>
            <span className="hidden sm:inline">Sign in</span>
          </Button>
        ) : (
          <AccountMenu />
        )}
      </div>
    </header>
  );
};
