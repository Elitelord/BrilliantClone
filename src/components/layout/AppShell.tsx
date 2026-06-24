import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Tailwind max-width classes (responsive). Defaults to the home-page column. */
  maxWidth?: string;
  /** Whether to vertically center content in a full-height column (used by auth/login). */
  centered?: boolean;
  className?: string;
}

/**
 * Centered, responsive page column shared by the flow-scrolled pages (Home, Login).
 * The lesson runner keeps its own fixed app-shell layout and does not use this.
 */
export default function AppShell({
  children,
  maxWidth = 'max-w-2xl lg:max-w-3xl',
  centered = false,
  className = '',
}: Props) {
  return (
    <div
      className={`mx-auto w-full px-4 ${maxWidth} ${
        centered ? 'flex min-h-[100dvh] flex-col justify-center' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
