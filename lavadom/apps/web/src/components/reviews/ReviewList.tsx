import type { Review } from "../../api/reviews";
import { Card } from "../ui/Card";
import { RatingStars } from "../providers/RatingStars";
import { useI18n } from "../../i18n";

export function ReviewList({ items }: { items: Review[] }) {
  const { t } = useI18n();

  return (
    <div className="grid gap-2">
      {items.map((r) => (
        <Card key={r.id}>
          <div className="flex items-center gap-2">
            <RatingStars value={r.rating} />
            <div className="text-xs text-neutral-500">{new Date(r.createdAt).toLocaleString()}</div>
          </div>
          {r.comment ? <div className="mt-2 text-sm whitespace-pre-wrap">{r.comment}</div> : null}
        </Card>
      ))}
      {items.length === 0 ? <div className="text-sm text-neutral-500">{t("review.list.empty")}</div> : null}
    </div>
  );
}
