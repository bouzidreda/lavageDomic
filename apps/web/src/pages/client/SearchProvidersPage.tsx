import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { searchProviders } from "../../api/providers";
import { ProviderFilters } from "../../components/providers/ProviderFilters";
import { ProviderList } from "../../components/providers/ProviderList";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

export default function SearchProvidersPage() {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"DISTANCE" | "RATING" | "PRICE">("DISTANCE");
  const [minRating, setMinRating] = useState(0);
  const [maxKm, setMaxKm] = useState(10);

  const m = useMutation({
    mutationFn: (v: { lat: number; lng: number }) =>
      searchProviders({
        lat: v.lat,
        lng: v.lng,
        maxKm,
        minRating: minRating || undefined,
        sort,
        q: q.trim() ? q.trim() : undefined
      })
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(p.coords.latitude);
        setLng(p.coords.longitude);
      },
      () => {
        setLat(30.4278);
        setLng(-9.5981);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const ready = useMemo(() => lat !== null && lng !== null, [lat, lng]);

  useEffect(() => {
    if (ready) m.mutate({ lat: lat!, lng: lng! });
  }, [ready, sort, minRating, maxKm]);

  return (
    <div className="grid gap-3">
      <Card>
        <div className="font-bold">Search</div>
        <div className="mt-2">
          <ProviderFilters
            q={q}
            setQ={setQ}
            sort={sort}
            setSort={setSort}
            minRating={minRating}
            setMinRating={setMinRating}
            maxKm={maxKm}
            setMaxKm={setMaxKm}
          />
        </div>
        <div className="mt-2 flex gap-2 items-center">
          <Button variant="ghost" onClick={() => ready && m.mutate({ lat: lat!, lng: lng! })} disabled={!ready || m.isPending}>
            Refresh
          </Button>
          <div className="text-xs text-neutral-500">
            {ready ? `lat ${lat!.toFixed(4)} lng ${lng!.toFixed(4)}` : "locating..."}
          </div>
        </div>
      </Card>

      <ProviderList items={m.data?.items ?? []} />
    </div>
  );
}
