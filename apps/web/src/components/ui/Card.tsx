import type { ReactNode } from "react";
import { clsx } from "clsx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("border rounded-xl p-3 bg-white", className)}>{children}</div>;
}
