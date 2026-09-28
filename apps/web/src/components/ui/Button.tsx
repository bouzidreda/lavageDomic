import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const { className, variant = "primary", ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx(
        "px-3 py-2 rounded-lg text-sm font-semibold border",
        variant === "primary" ? "bg-black text-white border-black" : "bg-white text-black border-neutral-200",
        "disabled:opacity-50",
        className
      )}
    />
  );
}
