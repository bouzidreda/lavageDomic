import { Badge } from "../ui/Badge";

export function DistancePill({ km }: { km?: number }) {
  if (km === undefined) return null;
  const v = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
  return <Badge className="border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]">{v}</Badge>;
}