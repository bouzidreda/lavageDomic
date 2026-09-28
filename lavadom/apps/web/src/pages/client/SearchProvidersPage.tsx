import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { searchProviders } from "../../api/providers";
import { ProviderFilters } from "../../components/providers/ProviderFilters";
import { ProviderList } from "../../components/providers/ProviderList";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useI18n } from "../../i18n";

export default function SearchProvidersPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const qFromUrl = (searchParams.get("q") ?? "").trim();
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [q, setQ] = useState(qFromUrl);
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

  useEffect(() => {
    setQ(qFromUrl);
  }, [qFromUrl]);

  const ready = useMemo(() => lat !== null && lng !== null, [lat, lng]);

  useEffect(() => {
    if (ready) m.mutate({ lat: lat!, lng: lng! });
  }, [ready, sort, minRating, maxKm, q]);

  return (
    <div className="grid gap-4">
      <section className="hero p-5 md:p-6">
        <div className="kicker">{t("search.kicker")}</div>
        <h1 className="page-title">{t("search.title")}</h1>
        <p className="page-subtitle">{t("search.subtitle")}</p>
      </section>

      <section className="layout-grid">
        <Card className="h-fit">
          <div className="text-sm font-extrabold">{t("search.filters")}</div>
          <div className="mt-3">
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

          <div className="mt-3 grid gap-2">
            <Button className="w-full" variant="ghost" onClick={() => ready && m.mutate({ lat: lat!, lng: lng! })} disabled={!ready || m.isPending}>
              {m.isPending ? t("search.refreshing") : t("search.refresh")}
            </Button>
            <div className="metric text-center">{ready ? `${t("search.lat")} ${lat!.toFixed(4)} | ${t("search.lng")} ${lng!.toFixed(4)}` : t("search.locating")}</div>
          </div>
        </Card>

        <div className="grid gap-3">
          <div className="text-sm font-semibold text-[var(--muted)]">{m.data?.items?.length ?? 0} {t("search.found")}</div>
          <ProviderList items={m.data?.items ?? []} />
        </div>
      </section>
    </div>
  );
}

