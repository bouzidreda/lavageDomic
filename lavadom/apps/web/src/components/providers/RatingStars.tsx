export function RatingStars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = Array.from({ length: 5 }).map((_, i) => {
    if (i < full) return "?";
    if (i === full && half) return "?";
    return "?";
  });
  return <span className="text-sm text-[var(--accent)]">{stars.join(" ")}</span>;
}