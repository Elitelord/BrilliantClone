// Emoji avatars. Stored as the emoji string itself (kept short by the rules).
export const AVATARS = [
  '🦊',
  '🐼',
  '🦉',
  '🐧',
  '🦄',
  '🐯',
  '🐸',
  '🐙',
  '🦁',
  '🐨',
  '🐺',
  '🦋',
  '🐝',
  '🐬',
  '🦈',
  '🦖',
  '🌟',
  '🚀',
  '🔥',
  '🌈',
] as const;

export const DEFAULT_AVATAR = '🦊';

export function normalizeAvatar(avatar?: string): string {
  return avatar && avatar.length > 0 ? avatar : DEFAULT_AVATAR;
}
