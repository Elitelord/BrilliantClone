import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'lg' | 'md';

// One home for the app's CTA look so press feedback (active:scale), focus rings, and
// disabled styling stay identical everywhere (they had drifted — some buttons lacked the
// press animation entirely). Layout extras go through `className`.
const BASE =
  'rounded-2xl font-bold transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed';

const SIZES: Record<Size, string> = {
  lg: 'py-4 text-base',
  md: 'py-3.5 text-base',
};

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 disabled:bg-slate-300 disabled:shadow-none',
  secondary: 'border border-slate-200 bg-white text-slate-600 disabled:opacity-60',
  danger: 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 disabled:bg-slate-300 disabled:shadow-none',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  className = '',
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`${fullWidth ? 'w-full ' : ''}${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
