import type { TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      {...rest}
      className={clsx(
        "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--ring)]",
        className
      )}
    />
  );
}