import type { Provider } from "../../api/providers";
import { ProviderCard } from "./ProviderCard";
import { useI18n } from "../../i18n";

export function ProviderList({ items }: { items: Provider[] }) {
  const { t } = useI18n();

  return (
    <div className="grid gap-3">
      {items.map((p) => (
        <ProviderCard key={p.id} p={p} />
      ))}
      {items.length === 0 ? <div className="shell-panel p-5 text-sm text-[var(--muted)]">{t("provider.list.empty")}</div> : null}
    </div>
  );
}
