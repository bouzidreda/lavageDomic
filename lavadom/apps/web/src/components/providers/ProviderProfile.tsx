import type { Provider } from "../../api/providers";
import { RatingStars } from "./RatingStars";
import { Badge } from "../ui/Badge";
import { useI18n } from "../../i18n";

export function ProviderProfile({ p }: { p: Provider }) {
  const { t } = useI18n();

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="text-xl font-bold">{p.name}</div>
        <Badge className="border-neutral-200">{p.ratingAvg.toFixed(2)} ({p.ratingCount})</Badge>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <RatingStars value={p.ratingAvg} />
        {p.city ? <span className="text-sm text-neutral-600">{p.city}</span> : null}
        <Badge className="border-neutral-200">{t("provider.card.from")} {p.priceFrom} MAD</Badge>
      </div>
      {p.bio ? <div className="mt-3 text-sm text-neutral-700 whitespace-pre-wrap">{p.bio}</div> : null}
    </div>
  );
}
