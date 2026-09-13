// src/components/ui/Modal.tsx
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /**
   * Optional footer content rendered inside a sticky bottom bar.
   * Use this for form actions (Save / Cancel). On mobile the footer
   * stays pinned to the bottom of the modal, on desktop it behaves
   * like a normal footer.
   */
  footer?: ReactNode;
  /**
   * When true, the modal takes up the full viewport on mobile
   * (no rounded corners, no floating card). Better for long forms.
   * Defaults to true.
   */
  fullScreenOnMobile?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
  footer,
  fullScreenOnMobile = true,
}: ModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const sizes: Record<string, string> = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className={`
            fixed inset-0 z-[100] flex
            ${fullScreenOnMobile ? 'items-stretch sm:items-center' : 'items-center'}
            justify-center
            p-0 sm:p-4
          `}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest-950/80 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              relative flex w-full flex-col bg-forest-900
              ${sizes[size]}
              ${fullScreenOnMobile
                ? 'h-full max-h-none rounded-none sm:h-auto sm:max-h-[90vh] sm:rounded-2xl'
                : 'max-h-[90vh] rounded-2xl'}
              border border-forest-500 shadow-2xl
              ${className || ''}
            `}
            role="dialog"
            aria-modal="true"
          >
            {/* Header — fixed at top, doesn't scroll */}
            {title && (
              <div className="flex flex-shrink-0 items-center justify-between border-b border-forest-500 px-4 py-3 sm:px-6 sm:py-4">
                <h3 className="pr-2 font-display text-base font-bold text-cream sm:text-lg">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 rounded-lg p-1.5 text-cream-muted transition hover:bg-forest-600 hover:text-cream"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Body — scrolls */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </div>

            {/* Footer — sticky bottom on mobile */}
            {footer && (
              <div
                className="
                  flex-shrink-0 border-t border-forest-500
                  bg-forest-900/95 backdrop-blur
                  p-4 sm:p-4
                "
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}