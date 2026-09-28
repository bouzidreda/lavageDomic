import { useQuery } from "@tanstack/react-query";
import { myBookings } from "../../api/bookings";
import { BookingList } from "../../components/bookings/BookingList";

export default function MyBookingsPage() {
  const q = useQuery({ queryKey: ["myBookings"], queryFn: myBookings });

  if (q.isLoading) return <div>Loading...</div>;
  return <BookingList items={q.data?.items ?? []} />;
}
