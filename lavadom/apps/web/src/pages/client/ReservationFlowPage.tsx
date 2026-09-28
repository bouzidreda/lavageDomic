import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { cmsBySlug } from "../../api/cms";
import { Card } from "../../components/ui/Card";
import { useI18n } from "../../i18n";

export default function ReservationFlowPage() {
  const { t } = useI18n();
  const qCms = useQuery({ queryKey: ["cms", "reservation-flow"], queryFn: () => cmsBySlug("reservation-flow") });
  const cms = qCms.data?.page;

  const steps = [
    { title: t("search.kicker"), body: t("search.subtitle") },
    { title: t("checkout.pickServices"), body: t("checkout.total") },
    { title: t("checkout.booking"), body: t("checkout.requestCreated") },
    { title: t("checkout.payment"), body: t("checkout.captured") }
  ];

  return (
    <div className="grid gap-4">
      <section className="hero p-5 md:p-6">
        <div className="kicker">{t("menu.title.services")}</div>
        <h1 className="page-title">{cms?.title ?? t("menu.link.reservationFlow")}</h1>
        <p className="page-subtitle">{cms?.content ?? t("home.service.booking.desc")}</p>
      </section>

      <section className="grid gap-3">
        {steps.map((s, i) => (
          <Card key={s.title}>
            <div className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t("common.step")} {i + 1}</div>
            <h2 className="mt-1 text-xl font-extrabold">{s.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{s.body}</p>
          </Card>
        ))}
      </section>

      <Card>
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-[var(--ink)] hover:bg-[var(--brand-strong)]"
            to="/search"
          >
            {t("menu.link.findServices")}
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-soft)]"
            to="/booking-and-kyc"
          >
            {t("home.service.booking.title")}
          </Link>
        </div>
      </Card>
    </div>
  );
}
