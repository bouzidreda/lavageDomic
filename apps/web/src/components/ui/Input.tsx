import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={clsx("w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm", className)} />;
}
