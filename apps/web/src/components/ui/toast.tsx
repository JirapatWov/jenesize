import * as React from 'react';

export function useToast() {
  const [toasts, setToasts] = React.useState<any[]>([]);

  const toast = React.useCallback((props: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, ...props }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toast, toasts };
}

