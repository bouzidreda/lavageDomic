import { Link } from "react-router-dom";
import type { Provider } from "../../api/providers";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { RatingStars } from "./RatingStars";
import { DistancePill } from "../maps/DistancePill";
import { useI18n } from "../../i18n";

export function ProviderCard({ p }: { p: Provider }) {
  const { t } = useI18n();

  return (
    <Card className="transition hover:-translate-y-0.5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link className="text-base font-extrabold hover:text-[var(--ink)]" to={`/providers/${p.id}`}>{p.name}</Link>
          <DistancePill km={p.distanceKm} />
          <Badge className="border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]">{p.verificationStatus}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <RatingStars value={p.ratingAvg} />
          <span className="text-xs text-[var(--muted)]">({p.ratingCount} {t("provider.card.ratings")})</span>
          <Badge className="border-[var(--border)] bg-[var(--surface-soft)] text-[var(--ink)]">{t("provider.card.from")} {p.priceFrom} MAD</Badge>
          {p.city ? <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{p.city}</span> : null}
        </div>

        {p.bio ? <div className="text-sm text-[var(--muted)] line-clamp-2">{p.bio}</div> : null}

        <div className="flex justify-end">
          <Link className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-extrabold text-[var(--ink)] hover:bg-[var(--brand-strong)]" to={`/checkout/${p.id}`}>
            {t("provider.card.book")}
          </Link>
        </div>
      </div>
    </Card>
  );
}
