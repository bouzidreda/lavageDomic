import type { Provider } from "../../api/providers";
import { ProviderCard } from "./ProviderCard";

export function ProviderList({ items }: { items: Provider[] }) {
  return (
    <div className="grid gap-2">
      {items.map((p) => <ProviderCard key={p.id} p={p} />)}
      {items.length === 0 ? <div className="text-sm text-neutral-500">No providers</div> : null}
    </div>
  );
}
