import type { ReactNode } from "react";
import { clsx } from "clsx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("card p-4 md:p-5", className)}>{children}</div>;
}