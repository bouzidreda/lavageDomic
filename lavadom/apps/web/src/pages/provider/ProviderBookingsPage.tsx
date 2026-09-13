import { useMutation, useQuery } from "@tanstack/react-query";
import { providerBookings, updateBookingStatus } from "../../api/bookings";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useI18n } from "../../i18n";

export default function ProviderBookingsPage() {
  const { t } = useI18n();
  const q = useQuery({ queryKey: ["providerBookings"], queryFn: providerBookings });
  const m = useMutation({ mutationFn: updateBookingStatus, onSuccess: () => q.refetch() });

  if (q.isLoading) return <div>{t("common.loading")}</div>;
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
            <Button variant="ghost" disabled={m.isPending} onClick={() => m.mutate({ bookingId: b.id, status: "ACCEPTED" })}>{t("provider.bookings.accept")}</Button>
            <Button variant="ghost" disabled={m.isPending} onClick={() => m.mutate({ bookingId: b.id, status: "DECLINED" })}>{t("provider.bookings.decline")}</Button>
            <Button variant="ghost" disabled={m.isPending} onClick={() => m.mutate({ bookingId: b.id, status: "ON_THE_WAY" })}>{t("provider.bookings.onWay")}</Button>
            <Button variant="ghost" disabled={m.isPending} onClick={() => m.mutate({ bookingId: b.id, status: "ARRIVED" })}>{t("provider.bookings.arrived")}</Button>
            <Button variant="ghost" disabled={m.isPending} onClick={() => m.mutate({ bookingId: b.id, status: "IN_PROGRESS" })}>{t("provider.bookings.start")}</Button>
            <Button variant="ghost" disabled={m.isPending} onClick={() => m.mutate({ bookingId: b.id, status: "DONE" })}>{t("provider.bookings.done")}</Button>
            <Button variant="ghost" disabled={m.isPending} onClick={() => m.mutate({ bookingId: b.id, status: "CANCELLED" })}>{t("provider.bookings.cancel")}</Button>
          </div>
        </Card>
      ))}
      {items.length === 0 ? <div className="text-sm text-neutral-500">{t("booking.list.empty")}</div> : null}
    </div>
  );
}
