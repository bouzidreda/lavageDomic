import { Link } from "react-router-dom";
import type { Provider } from "../../api/providers";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { RatingStars } from "./RatingStars";
import { DistancePill } from "../maps/DistancePill";

export function ProviderCard({ p }: { p: Provider }) {
  return (
    <Card className="flex gap-3 items-start">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link className="font-bold underline truncate" to={`/providers/${p.id}`}>{p.name}</Link>
          <DistancePill km={p.distanceKm} />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <RatingStars value={p.ratingAvg} />
          <span className="text-xs text-neutral-500">({p.ratingCount})</span>
          <Badge className="border-neutral-200">from {p.priceFrom} MAD</Badge>
        </div>
        {p.city ? <div className="mt-1 text-xs text-neutral-500">{p.city}</div> : null}
        {p.bio ? <div className="mt-2 text-sm text-neutral-700 line-clamp-2">{p.bio}</div> : null}
      </div>
      <Link className="underline text-sm" to={`/checkout/${p.id}`}>Book</Link>
    </Card>
  );
}
