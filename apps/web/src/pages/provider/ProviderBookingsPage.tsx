import { useMutation, useQuery } from "@tanstack/react-query";
import { providerBookings, updateBookingStatus } from "../../api/bookings";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export default function ProviderBookingsPage() {
  const q = useQuery({ queryKey: ["providerBookings"], queryFn: providerBookings });
  const m = useMutation({ mutationFn: updateBookingStatus });

  if (q.isLoading) return <div>Loading...</div>;
  const items = q.data?.items ?? [];

  return (
    <div className="grid gap-2">
      {items.map((b) => (
        <Card key={b.id}>
          <div className="flex items-center gap-2">
            <div className="font-bold">#{b.id.slice(0, 8)}</div>
            <div className="text-sm">{b.status}</div>
            <div className="ml-auto text-sm">{b.totalPrice} MAD</div>
          </div>
          <div className="mt-2 text-sm">
            <div>{new Date(b.scheduledAt).toLocaleString()}</div>
            <div className="text-neutral-600">{b.address}</div>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Button variant="ghost" disabled={m.isPending} onClick={() => m.mutate({ bookingId: b.id, status: "CONFIRMED" })}>Confirm</Button>
            <Button variant="ghost" disabled={m.isPending} onClick={() => m.mutate({ bookingId: b.id, status: "IN_PROGRESS" })}>Start</Button>
            <Button variant="ghost" disabled={m.isPending} onClick={() => m.mutate({ bookingId: b.id, status: "DONE" })}>Done</Button>
            <Button variant="ghost" disabled={m.isPending} onClick={() => m.mutate({ bookingId: b.id, status: "CANCELLED" })}>Cancel</Button>
          </div>
        </Card>
      ))}
      {items.length === 0 ? <div className="text-sm text-neutral-500">No bookings</div> : null}
    </div>
  );
}
