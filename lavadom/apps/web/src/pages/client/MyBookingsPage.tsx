import { useQuery } from "@tanstack/react-query";
import { myBookings } from "../../api/bookings";
import { BookingList } from "../../components/bookings/BookingList";
import { useI18n } from "../../i18n";

export default function MyBookingsPage() {
  const { t } = useI18n();
  const q = useQuery({ queryKey: ["myBookings"], queryFn: myBookings });

  if (q.isLoading) return <div>{t("common.loading")}</div>;
  return <BookingList items={q.data?.items ?? []} />;
}
