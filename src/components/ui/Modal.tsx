import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Pinned to the bottom of the sheet, outside the scrolling body. */
  footer?: React.ReactNode;
  size?: 'md' | 'lg';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  footer,
  size = 'md',
  children,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape to dismiss, and hold the page still while the sheet is open.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    panelRef.current?.querySelector<HTMLElement>(
      'input:not([type="hidden"]), select, textarea, button',
    )?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-ink/35 backdrop-blur-[2px] animate-fade"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full bg-surface border border-line shadow-[var(--shadow-overlay)]',
          'rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[92dvh] animate-scale-in',
          size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-xl',
        )}
      >
        <header className="flex items-start gap-4 px-6 sm:px-7 pt-6 pb-5 border-b border-line">
          {Icon && (
            <span className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-brand-tint text-brand">
              <Icon className="w-5 h-5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold tracking-[-0.01em] leading-snug">{title}</h2>
            {description && <p className="mt-1 text-[0.9375rem] text-ink-soft">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 -mt-1 -mr-1.5 grid place-items-center w-10 h-10 rounded-xl text-ink-faint hover:bg-sunken hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 sm:px-7 py-6">{children}</div>

        {footer && (
          <footer className="px-6 sm:px-7 py-4 border-t border-line bg-sunken/60 rounded-b-2xl">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};
