import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { cmsBySlug } from "../../api/cms";
import { Card } from "../../components/ui/Card";
import { useI18n } from "../../i18n";

export default function BookingKycPage() {
  const { t } = useI18n();
  const qCms = useQuery({ queryKey: ["cms", "booking-and-kyc"], queryFn: () => cmsBySlug("booking-and-kyc") });
  const cms = qCms.data?.page;

  return (
    <div className="grid gap-4">
      <section className="hero p-5 md:p-6">
        <div className="kicker">{t("menu.title.platform")}</div>
        <h1 className="page-title">{cms?.title ?? t("home.service.booking.title")}</h1>
        <p className="page-subtitle">{cms?.content ?? t("home.service.booking.desc")}</p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-extrabold">{t("checkout.booking")}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{t("checkout.requestCreated")}</p>
        </Card>
        <Card>
          <h2 className="text-xl font-extrabold">{t("menu.link.kycPolicy")}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{t("home.security.cardBody")}</p>
        </Card>
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
            to="/kyc-policy"
          >
            {t("menu.link.kycPolicy")}
          </Link>
        </div>
      </Card>
    </div>
  );
}
