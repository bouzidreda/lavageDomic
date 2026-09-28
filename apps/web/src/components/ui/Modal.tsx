import type { ReactNode } from "react";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-3" onMouseDown={onClose}>
      <div className="w-full max-w-lg bg-white rounded-xl border p-3" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <div className="font-bold">{title}</div>
          <button className="ml-auto underline text-sm" onClick={onClose}>Close</button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
