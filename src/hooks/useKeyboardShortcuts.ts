import { useEffect, useRef } from "react";

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
export function useKeyboardShortcuts(handlers: Handlers): void {
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

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
          handlersRef.current.onClearPaths?.();
        }
      } else if (key === "h") {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          handlersRef.current.onTogglePanel?.();
        }
      } else if (e.ctrlKey || e.metaKey) {
        if (key === "z") {
          if (e.shiftKey) {
            e.preventDefault();
            handlersRef.current.onRedo();
          } else {
            e.preventDefault();
            handlersRef.current.onUndo();
          }
        } else if (key === "y") {
          e.preventDefault();
          handlersRef.current.onRedo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
