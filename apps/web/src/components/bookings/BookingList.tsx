import type { Booking } from "../../api/bookings";
import { BookingCard } from "./BookingCard";

export function BookingList({ items }: { items: Booking[] }) {
  return (
    <div className="grid gap-2">
      {items.map((b) => <BookingCard key={b.id} b={b} />)}
      {items.length === 0 ? <div className="text-sm text-neutral-500">No bookings</div> : null}
    </div>
  );
}
