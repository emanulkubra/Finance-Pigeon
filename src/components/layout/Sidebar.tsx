import React, { useEffect } from 'react';
import { useFinance, type TabType } from '../../context/FinanceContext';
import {
  LayoutGrid,
  ArrowLeftRight,
  ChartPie,
  PiggyBank,
  RefreshCw,
  Compass,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '../../lib/cn';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Grouped so the list reads as three short sets rather than one long menu. */
const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Money',
    items: [
      { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
      { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
      { id: 'analytics', label: 'Insights', icon: ChartPie },
    ],
  },
  {
    heading: 'Planning',
    items: [
      { id: 'goals', label: 'Savings Goals', icon: PiggyBank },
      { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
      { id: 'ai-advisor', label: 'Purchase Advisor', icon: Compass },
    ],
  },
];

const NavButton: React.FC<{ item: NavItem; isActive: boolean; onSelect: () => void }> = ({
  item,
  isActive,
  onSelect,
}) => {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative w-full flex items-center gap-3 h-12 px-3.5 rounded-xl',
        'text-[0.9375rem] font-medium transition-colors duration-150',
        isActive
          ? 'bg-brand-tint text-brand font-semibold'
          : 'text-ink-soft hover:bg-sunken hover:text-ink',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-brand" />
      )}
      <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-brand' : 'text-ink-faint')} />
      <span className="truncate">{item.label}</span>
    </button>
  );
};

const Wordmark: React.FC = () => (
  <div className="flex items-center gap-3">
    <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand text-on-brand text-lg">
      🐦
    </span>
    <span className="font-display text-[1.4rem] leading-none tracking-[-0.01em]">
      Finance Pigeon
    </span>
  </div>
);

const NavContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { activeTab, setActiveTab, healthReport } = useFinance();

  const go = (tab: TabType) => {
    setActiveTab(tab);
    onNavigate?.();
  };

  return (
    <>
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading}>
            <p className="eyebrow px-3.5 mb-2">{group.heading}</p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  isActive={activeTab === item.id}
                  onSelect={() => go(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 pt-3 border-t border-line space-y-3">
        <button
          type="button"
          onClick={() => go('ai-advisor')}
          className="w-full text-left p-4 rounded-xl bg-sunken border border-line hover:border-line-strong transition-colors"
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[0.9375rem] font-medium text-ink-soft">Financial health</span>
            <span className="text-[0.8125rem] font-semibold text-brand">{healthReport.grade}</span>
          </div>
          <div className="tnum mt-1 text-[1.75rem] font-semibold leading-none tracking-[-0.02em]">
            {healthReport.score}
            <span className="text-base font-normal text-ink-faint"> / 100</span>
          </div>
          <div className="mt-2.5 h-1.5 rounded-full bg-line overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500"
              style={{ width: `${Math.min(100, healthReport.score)}%` }}
            />
          </div>
        </button>

        <NavButton
          item={{ id: 'settings', label: 'Settings', icon: Settings }}
          isActive={activeTab === 'settings'}
          onSelect={() => go('settings')}
        />
      </div>
    </>
  );
};

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseMobile();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobileOpen, onCloseMobile]);

  return (
    <>
      {/* Desktop rail */}
      {/* self-start keeps the rail from stretching to page height so it can stick. */}
      <aside className="hidden lg:flex flex-col w-[17rem] shrink-0 self-start sticky top-0 h-[100dvh] border-r border-line bg-surface">
        <div className="px-5 h-[4.5rem] flex items-center border-b border-line">
          <Wordmark />
        </div>
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="relative flex flex-col w-[17.5rem] max-w-[85vw] bg-surface border-r border-line shadow-[var(--shadow-overlay)] animate-fade-up"
          >
            <div className="px-5 h-[4.5rem] flex items-center justify-between border-b border-line">
              <Wordmark />
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation"
                className="grid place-items-center w-10 h-10 -mr-2 rounded-xl text-ink-faint hover:bg-sunken hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavContent onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
};
