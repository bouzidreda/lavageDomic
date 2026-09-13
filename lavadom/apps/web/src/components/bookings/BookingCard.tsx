import type { Booking } from "../../api/bookings";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useI18n } from "../../i18n";

export function BookingCard({ b }: { b: Booking }) {
  const { t } = useI18n();

  return (
    <Card>
      <div className="flex items-center gap-2">
        <div className="font-bold">{t("booking.card.title")}</div>
        <Badge className="border-neutral-200">{b.status}</Badge>
        <Badge className="border-neutral-200">{b.paymentStatus}</Badge>
        <div className="ml-auto text-sm">{b.totalPrice} MAD</div>
      </div>
      <div className="mt-2 text-sm">
        <div><span className="text-neutral-500">{t("booking.card.scheduled")}:</span> {new Date(b.scheduledAt).toLocaleString()}</div>
        <div><span className="text-neutral-500">{t("booking.card.address")}:</span> {b.address}</div>
        {b.notes ? <div><span className="text-neutral-500">{t("booking.card.notes")}:</span> {b.notes}</div> : null}
      </div>
    </Card>
  );
}
