import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { cmsBySlug } from "../../api/cms";
import { Card } from "../../components/ui/Card";
import { useI18n } from "../../i18n";

export default function KycPolicyPage() {
  const { t } = useI18n();
  const qCms = useQuery({ queryKey: ["cms", "kyc-policy"], queryFn: () => cmsBySlug("kyc-policy") });
  const cms = qCms.data?.page;

  const points = [t("home.footer.policy"), t("home.footer.data"), t("home.footer.report")];

  return (
    <div className="grid gap-4">
      <section className="hero p-5 md:p-6">
        <div className="kicker">{t("home.security.pill")}</div>
        <h1 className="page-title">{cms?.title ?? t("menu.link.kycPolicy")}</h1>
        <p className="page-subtitle">{cms?.content ?? t("home.security.cardBody")}</p>
      </section>

      <section className="grid gap-3">
        {points.map((point) => (
          <Card key={point}>
            <h2 className="text-xl font-extrabold">{point}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {t("home.service.booking.desc")}
            </p>
          </Card>
        ))}
      </section>

      <Card>
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-[var(--ink)] hover:bg-[var(--brand-strong)]"
            to="/booking-and-kyc"
          >
            {t("home.service.booking.title")}
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-soft)]"
            to="/contact"
          >
            {t("menu.link.contact")}
          </Link>
        </div>
      </Card>
    </div>
  );
}
