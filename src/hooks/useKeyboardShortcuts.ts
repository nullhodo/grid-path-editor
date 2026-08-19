import { useEffect } from "react";

interface Handlers {
  onUndo: () => void;
  onRedo: () => void;
  onClearPaths?: () => void;
  onTogglePanel?: () => void;
}

/**
 * Custom hook to register global keyboard shortcuts:
 * - C: Clear All Paths
 * - H: Toggle Tool Panel
 * - Ctrl+Z: Undo
 * - Ctrl+Y / Ctrl+Shift+Z: Redo
 */
export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onClearPaths,
  onTogglePanel,
}: Handlers): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when typing inside input elements
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Actions
      if (key === "c") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onClearPaths?.();
        }
      } else if (key === "h") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onTogglePanel?.();
        }
      } else if (e.ctrlKey || e.metaKey) {
        if (key === "z") {
          if (e.shiftKey) {
            e.preventDefault();
            onRedo();
          } else {
            e.preventDefault();
            onUndo();
          }
        } else if (key === "y") {
          e.preventDefault();
          onRedo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUndo, onRedo, onClearPaths, onTogglePanel]);
}
