import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProvider } from "../../api/providers";
import { listProviderReviews } from "../../api/reviews";
import { ProviderProfile } from "../../components/providers/ProviderProfile";
import { Card } from "../../components/ui/Card";
import { ReviewList } from "../../components/reviews/ReviewList";

export default function ProviderDetailsPage() {
  const { id } = useParams();
  const q = useQuery({ queryKey: ["provider", id], queryFn: () => getProvider(id!), enabled: !!id });
  const r = useQuery({ queryKey: ["reviews", id], queryFn: () => listProviderReviews(id!), enabled: !!id });

  if (q.isLoading) return <div>Loading...</div>;
  if (!q.data) return <div>Not found</div>;

  return (
    <div className="grid gap-3">
      <Card>
        <ProviderProfile p={q.data.provider} />
        <div className="mt-3 flex gap-2">
          <Link className="underline text-sm" to={`/checkout/${q.data.provider.id}`}>Book now</Link>
        </div>
      </Card>

      <Card>
        <div className="font-bold">Services</div>
        <div className="mt-2 grid gap-2">
          {q.data.services.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className="text-sm">{s.name}</div>
              <div className="ml-auto text-sm">{s.price} MAD</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="font-bold">Reviews</div>
        <div className="mt-2">
          <ReviewList items={r.data?.items ?? []} />
        </div>
      </Card>
    </div>
  );
}
