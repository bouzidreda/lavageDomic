import { clsx } from "clsx";

export function Badge({ children, className }: { children: string; className?: string }) {
  return <span className={clsx("inline-flex items-center px-2 py-1 rounded-full text-xs border", className)}>{children}</span>;
}
