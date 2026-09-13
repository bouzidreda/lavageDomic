import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { cmsBySlug } from "../../api/cms";
import { Card } from "../../components/ui/Card";
import { useI18n } from "../../i18n";

export default function ContactPage() {
  const { t } = useI18n();
  const qCms = useQuery({ queryKey: ["cms", "contact"], queryFn: () => cmsBySlug("contact") });
  const cms = qCms.data?.page;

  return (
    <div className="grid gap-4">
      <section className="hero p-5 md:p-6">
        <div className="kicker">{t("menu.title.support")}</div>
        <h1 className="page-title">{cms?.title ?? t("menu.link.contact")}</h1>
        <p className="page-subtitle">{cms?.content ?? t("home.footer.about")}</p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Card>
          <h2 className="text-xl font-extrabold">{t("home.footer.partner")}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">support@lavadom.ma</p>
        </Card>
        <Card>
          <h2 className="text-xl font-extrabold">{t("home.footer.contact")}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">+212 6 00 00 00 00</p>
        </Card>
        <Card>
          <h2 className="text-xl font-extrabold">{t("home.footer.report")}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">trust@lavadom.ma</p>
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
            to="/"
          >
            {t("menu.link.home")}
          </Link>
        </div>
      </Card>
    </div>
  );
}
