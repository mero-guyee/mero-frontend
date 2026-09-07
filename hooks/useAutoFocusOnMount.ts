import { useEffect } from 'react';

const AUTO_FOCUS_DELAY = 400;

interface Focusable {
  focus: () => void;
}

export function useAutoFocusOnMount(ref: React.RefObject<Focusable | null>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => ref.current?.focus(), AUTO_FOCUS_DELAY);
    return () => clearTimeout(timer);
  }, [enabled]);
}
