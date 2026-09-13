import type { Booking } from "../../api/bookings";
import { BookingCard } from "./BookingCard";
import { useI18n } from "../../i18n";

export function BookingList({ items }: { items: Booking[] }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-2">
      {items.map((b) => <BookingCard key={b.id} b={b} />)}
      {items.length === 0 ? <div className="text-sm text-neutral-500">{t("booking.list.empty")}</div> : null}
    </div>
  );
}
