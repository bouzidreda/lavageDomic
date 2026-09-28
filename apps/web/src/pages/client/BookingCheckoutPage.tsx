import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getProvider } from "../../api/providers";
import { createBooking } from "../../api/bookings";
import { BookingForm } from "../../components/bookings/BookingForm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useState } from "react";

export default function BookingCheckoutPage() {
  const { providerId } = useParams();
  const q = useQuery({ queryKey: ["provider", providerId], queryFn: () => getProvider(providerId!), enabled: !!providerId });
  const [serviceIds, setServiceIds] = useState<string[]>([]);

  const m = useMutation({
    mutationFn: (v: { scheduledAt: string; address: string; notes?: string }) =>
      createBooking({ providerId: providerId!, scheduledAt: v.scheduledAt, address: v.address, notes: v.notes, serviceIds })
  });

  if (q.isLoading) return <div>Loading...</div>;
  if (!q.data) return <div>Not found</div>;

  return (
    <div className="grid gap-3">
      <Card>
        <div className="font-bold">Pick services</div>
        <div className="mt-2 grid gap-2">
          {q.data.services.map((s) => {
            const on = serviceIds.includes(s.id);
            return (
              <button
                key={s.id}
                className={"border rounded-xl p-3 text-left " + (on ? "border-black" : "border-neutral-200")}
                onClick={() => setServiceIds((prev) => on ? prev.filter((x) => x !== s.id) : [...prev, s.id])}
              >
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="ml-auto text-sm">{s.price} MAD</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-2">
          <Button variant="ghost" onClick={() => setServiceIds([])}>Clear</Button>
        </div>
      </Card>

      <Card>
        <div className="font-bold">Booking</div>
        <div className="mt-2">
          <BookingForm busy={m.isPending} onSubmit={(v) => m.mutate(v)} />
          {m.isSuccess ? <div className="mt-2 text-sm">Created</div> : null}
          {m.isError ? <div className="mt-2 text-sm text-red-600">Failed</div> : null}
        </div>
      </Card>
    </div>
  );
}
