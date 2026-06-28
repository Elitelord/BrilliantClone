import { useEffect, useRef } from 'react';

function inTextField(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type;
    return type !== 'checkbox' && type !== 'radio' && type !== 'button' && type !== 'submit';
  }
  return (el as HTMLElement).isContentEditable;
}

/**
 * Fire `handler` when the user presses Enter (window-level), so the primary action of a
 * runner can be triggered from the keyboard. While focus is in a text field
 * (textarea / text input / contenteditable) plain Enter is left alone so it can still
 * insert text — there, Cmd/Ctrl+Enter submits instead. No-op when `enabled` is false.
 */
export function useEnterKey(handler: () => void, enabled = true): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return;
      if (inTextField(document.activeElement) && !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      ref.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}
