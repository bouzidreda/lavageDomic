import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getProvider } from "../../api/providers";
import { capturePayment, createBooking, createPaymentIntent } from "../../api/bookings";
import { BookingForm } from "../../components/bookings/BookingForm";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useMemo, useState } from "react";
import { GoogleMapPlaceholder } from "../../components/maps/GoogleMapPlaceholder";
import { useI18n } from "../../i18n";

export default function BookingCheckoutPage() {
  const { t } = useI18n();
  const { providerId } = useParams();
  const q = useQuery({ queryKey: ["provider", providerId], queryFn: () => getProvider(providerId!), enabled: !!providerId });
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const mCreateBooking = useMutation({
    mutationFn: (v: { scheduledAt: string; address: string; notes?: string }) =>
      createBooking({ providerId: providerId!, scheduledAt: v.scheduledAt, address: v.address, notes: v.notes, serviceIds }),
    onSuccess: (res) => setCreatedBookingId(res.booking.id)
  });

  const mPaymentIntent = useMutation({ mutationFn: (bookingId: string) => createPaymentIntent({ bookingId, method: "PAYPAL" }) });
  const mCapture = useMutation({ mutationFn: (bookingId: string) => capturePayment({ bookingId }) });

  const selectedTotal = useMemo(() => {
    const priceById = new Map((q.data?.services ?? []).map((s) => [s.id, s.price]));
    return serviceIds.reduce((sum, id) => sum + Number(priceById.get(id) ?? 0), 0);
  }, [q.data?.services, serviceIds]);

  if (q.isLoading) return <div>{t("common.loading")}</div>;
  if (!q.data) return <div>{t("common.notFound")}</div>;

  return (
    <div className="grid gap-3">
      <Card>
        <div className="font-bold">{t("checkout.pickServices")}</div>
        <div className="mt-2 grid gap-2">
          {q.data.services.map((s) => {
            const on = serviceIds.includes(s.id);
            return (
              <button
                key={s.id}
                className={"border rounded-xl p-3 text-left " + (on ? "border-black" : "border-neutral-200")}
                onClick={() => setServiceIds((prev) => (on ? prev.filter((x) => x !== s.id) : [...prev, s.id]))}
              >
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="ml-auto text-sm">{s.price} MAD</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-sm text-neutral-600">{t("checkout.total")}: {selectedTotal} MAD</div>
        <div className="mt-2">
          <Button variant="ghost" onClick={() => setServiceIds([])}>
            {t("checkout.clear")}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="font-bold">{t("checkout.map")}</div>
        <div className="mt-2">
          <GoogleMapPlaceholder lat={q.data.provider.lat} lng={q.data.provider.lng} />
        </div>
      </Card>

      <Card>
        <div className="font-bold">{t("checkout.booking")}</div>
        <div className="mt-2">
          <BookingForm
            busy={mCreateBooking.isPending}
            blocked={serviceIds.length === 0}
            onSubmit={(v) => mCreateBooking.mutate(v)}
          />
          {serviceIds.length === 0 ? <div className="mt-2 text-sm text-amber-700">{t("checkout.selectServiceFirst")}</div> : null}
          {mCreateBooking.isSuccess ? <div className="mt-2 text-sm">{t("checkout.requestCreated")}</div> : null}
          {mCreateBooking.isError ? <div className="mt-2 text-sm text-red-600">{t("common.failed")}</div> : null}
        </div>
      </Card>

      {createdBookingId ? (
        <Card>
          <div className="font-bold">{t("checkout.payment")}</div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Button
              variant="ghost"
              disabled={mPaymentIntent.isPending}
              onClick={() => mPaymentIntent.mutate(createdBookingId)}
            >
              {mPaymentIntent.isPending ? "..." : t("checkout.createPaypal")}
            </Button>
            <Button variant="ghost" disabled={mCapture.isPending} onClick={() => mCapture.mutate(createdBookingId)}>
              {mCapture.isPending ? "..." : t("checkout.capture")}
            </Button>
          </div>
          {mPaymentIntent.data?.payment ? (
            <div className="mt-2 text-sm text-neutral-700">
              {t("checkout.intentCreated")}: {mPaymentIntent.data.payment.providerOrderId}
              {mPaymentIntent.data.payment.approveUrl ? (
                <a className="underline ml-2" href={mPaymentIntent.data.payment.approveUrl} target="_blank" rel="noreferrer">
                  {t("checkout.openPaypal")}
                </a>
              ) : null}
            </div>
          ) : null}
          {mCapture.data?.payment ? <div className="mt-2 text-sm text-blue-700">{t("checkout.captured")}</div> : null}
        </Card>
      ) : null}
    </div>
  );
}
