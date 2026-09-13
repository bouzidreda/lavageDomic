import { createContext, useContext, useMemo, useState } from "react";

type ToastItem = { id: string; msg: string };

const ToastCtx = createContext<{ push: (msg: string) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("ToastCtx missing");
  return ctx;
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const api = useMemo(() => ({
    push(msg: string) {
      const id = crypto.randomUUID();
      setItems((s) => [{ id, msg }, ...s].slice(0, 3));
      setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2500);
    }
  }), []);

  return (
    <ToastCtx.Provider value={api as any}>
      <div className="fixed right-3 bottom-3 grid gap-2 z-50">
        {items.map((t) => (
          <div key={t.id} className="bg-white border rounded-xl p-3 shadow-sm text-sm">{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
