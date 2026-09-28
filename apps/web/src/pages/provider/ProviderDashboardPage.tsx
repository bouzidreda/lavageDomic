import { useQuery } from "@tanstack/react-query";
import { myProviderProfile } from "../../api/providers";
import { Card } from "../../components/ui/Card";

export default function ProviderDashboardPage() {
  const q = useQuery({ queryKey: ["providerMe"], queryFn: myProviderProfile });

  if (q.isLoading) return <div>Loading...</div>;
  const p = q.data?.provider;
  if (!p) return <div>Not found</div>;

  return (
    <div className="grid gap-3">
      <Card>
        <div className="text-xl font-bold">Provider dashboard</div>
        <div className="mt-2 text-sm text-neutral-600">Rating {p.ratingAvg.toFixed(2)} ({p.ratingCount})</div>
        <div className="mt-1 text-sm text-neutral-600">Radius {p.radiusKm} km</div>
        <div className="mt-1 text-sm text-neutral-600">Price from {p.priceFrom} MAD</div>
      </Card>
    </div>
  );
}
