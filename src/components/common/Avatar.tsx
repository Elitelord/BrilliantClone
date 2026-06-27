import { normalizeAvatar } from '../../lib/avatars';

interface Props {
  avatar?: string;
  /** Tailwind size classes for the square (e.g. 'h-10 w-10'). */
  size?: string;
  /** Tailwind text size for the emoji. */
  text?: string;
  className?: string;
  ring?: boolean;
}

export default function Avatar({
  avatar,
  size = 'h-10 w-10',
  text = 'text-xl',
  className = '',
  ring = false,
}: Props) {
  return (
    <div
      className={`flex flex-none items-center justify-center rounded-2xl bg-brand-100 ${size} ${text} ${
        ring ? 'ring-2 ring-white' : ''
      } ${className}`}
    >
      <span aria-hidden>{normalizeAvatar(avatar)}</span>
    </div>
  );
}
