import type { TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={clsx("w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm", className)} />;
}
