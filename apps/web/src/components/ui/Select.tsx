import type { SelectHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return <select {...rest} className={clsx("w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm bg-white", className)} />;
}
