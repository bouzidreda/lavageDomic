import type { Booking } from "../../api/bookings";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

export function BookingCard({ b }: { b: Booking }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <div className="font-bold">Booking</div>
        <Badge className="border-neutral-200">{b.status}</Badge>
        <div className="ml-auto text-sm">{b.totalPrice} MAD</div>
      </div>
      <div className="mt-2 text-sm">
        <div><span className="text-neutral-500">Scheduled:</span> {new Date(b.scheduledAt).toLocaleString()}</div>
        <div><span className="text-neutral-500">Address:</span> {b.address}</div>
        {b.notes ? <div><span className="text-neutral-500">Notes:</span> {b.notes}</div> : null}
      </div>
    </Card>
  );
}
