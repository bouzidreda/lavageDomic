import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const { className, variant = "primary", ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "border border-transparent bg-[var(--brand)] text-[var(--ink)] hover:bg-[var(--brand-strong)]"
          : "border border-[var(--border)] bg-white text-[var(--text)] hover:bg-[var(--surface-soft)]",
        className
      )}
    />
  );
}