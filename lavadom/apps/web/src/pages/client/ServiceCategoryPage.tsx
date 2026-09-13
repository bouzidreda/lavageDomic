import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { cmsBySlug } from "../../api/cms";
import { Card } from "../../components/ui/Card";
import { useI18n } from "../../i18n";

type ServiceTypeInfo = {
  nameKey: string;
  detailKey: string;
};

type ServiceConfig = {
  titleKey: string;
  descKey: string;
  heroImage: string;
  detailImage: string;
  query: string;
  cmsSlug: string;
  introKey: string;
  focusAreaKeys: string[];
  serviceTypes: ServiceTypeInfo[];
  workflowKeys: string[];
  audienceKeys: string[];
};

const serviceMap: Record<string, ServiceConfig> = {
  "car-wash": {
    titleKey: "home.service.auto.title",
    descKey: "home.service.auto.desc",
    heroImage: "/images/service-pages/car-wash-hero.jpg",
    detailImage: "/images/service-pages/car-wash-detail.jpg",
    query: "car wash",
    cmsSlug: "service-car-wash",
    introKey: "service.carWash.intro",
    focusAreaKeys: ["service.carWash.focus.1", "service.carWash.focus.2", "service.carWash.focus.3"],
    serviceTypes: [
      { nameKey: "service.carWash.type.1.name", detailKey: "service.carWash.type.1.detail" },
      { nameKey: "service.carWash.type.2.name", detailKey: "service.carWash.type.2.detail" },
      { nameKey: "service.carWash.type.3.name", detailKey: "service.carWash.type.3.detail" }
    ],
    workflowKeys: [
      "service.carWash.workflow.1",
      "service.carWash.workflow.2",
      "service.carWash.workflow.3"
    ],
    audienceKeys: [
      "service.carWash.audience.1",
      "service.carWash.audience.2",
      "service.carWash.audience.3"
    ]
  },
  "carpet-cleaning": {
    titleKey: "home.service.carpet.title",
    descKey: "home.service.carpet.desc",
    heroImage: "/images/service-pages/carpet-hero.jpg",
    detailImage: "/images/service-pages/carpet-detail.jpg",
    query: "carpet",
    cmsSlug: "service-carpet-cleaning",
    introKey: "service.carpet.intro",
    focusAreaKeys: ["service.carpet.focus.1", "service.carpet.focus.2", "service.carpet.focus.3"],
    serviceTypes: [
      { nameKey: "service.carpet.type.1.name", detailKey: "service.carpet.type.1.detail" },
      { nameKey: "service.carpet.type.2.name", detailKey: "service.carpet.type.2.detail" },
      { nameKey: "service.carpet.type.3.name", detailKey: "service.carpet.type.3.detail" }
    ],
    workflowKeys: [
      "service.carpet.workflow.1",
      "service.carpet.workflow.2",
      "service.carpet.workflow.3"
    ],
    audienceKeys: [
      "service.carpet.audience.1",
      "service.carpet.audience.2",
      "service.carpet.audience.3"
    ]
  },
  "blanket-laundry": {
    titleKey: "home.service.blanket.title",
    descKey: "home.service.blanket.desc",
    heroImage: "/images/service-pages/blanket-hero.jpg",
    detailImage: "/images/service-pages/blanket-detail.jpg",
    query: "blanket",
    cmsSlug: "service-blanket-laundry",
    introKey: "service.blanket.intro",
    focusAreaKeys: ["service.blanket.focus.1", "service.blanket.focus.2", "service.blanket.focus.3"],
    serviceTypes: [
      { nameKey: "service.blanket.type.1.name", detailKey: "service.blanket.type.1.detail" },
      { nameKey: "service.blanket.type.2.name", detailKey: "service.blanket.type.2.detail" },
      { nameKey: "service.blanket.type.3.name", detailKey: "service.blanket.type.3.detail" }
    ],
    workflowKeys: [
      "service.blanket.workflow.1",
      "service.blanket.workflow.2",
      "service.blanket.workflow.3"
    ],
    audienceKeys: [
      "service.blanket.audience.1",
      "service.blanket.audience.2",
      "service.blanket.audience.3"
    ]
  }
};

export default function ServiceCategoryPage() {
  const { t } = useI18n();
  const { service = "" } = useParams();
  const cfg = serviceMap[service];

  if (!cfg) return <Navigate to="/search" replace />;
  const qCms = useQuery({ queryKey: ["cms", cfg.cmsSlug], queryFn: () => cmsBySlug(cfg.cmsSlug) });
  const cms = qCms.data?.page;

  return (
    <div className="grid gap-4">
      <section
        className="relative overflow-hidden rounded-[24px] p-5 md:p-7"
        style={{
          background: `linear-gradient(105deg, rgba(8, 11, 16, 0.78) 0%, rgba(8, 11, 16, 0.38) 45%, rgba(8, 11, 16, 0.2) 100%), url('${cfg.heroImage}') center/cover no-repeat`
        }}
      >
        <div className="max-w-3xl">
          <div className="kicker !text-white/90">{t("menu.title.services2")}</div>
          <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.03] text-white">{cms?.title ?? t(cfg.titleKey)}</h1>
          <p className="mt-3 text-sm text-white/90 md:text-base">{cms?.content ?? t(cfg.introKey)}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {cfg.focusAreaKeys.map((itemKey) => (
            <span
              key={itemKey}
              className="rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-bold text-white md:text-sm"
            >
              {t(itemKey)}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {cfg.serviceTypes.map((item) => (
          <Card key={item.nameKey}>
            <div className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{t("service.page.type")}</div>
            <h2 className="mt-1 text-xl font-extrabold">{t(item.nameKey)}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{t(item.detailKey)}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <img
            src={cfg.detailImage}
            alt={t(cfg.titleKey)}
            className="h-[300px] w-full rounded-xl object-cover md:h-[360px]"
          />
          <p className="mt-3 text-sm text-[var(--muted)]">{t(cfg.descKey)}</p>
        </Card>
        <Card className="grid content-start gap-4">
          <div>
            <h2 className="text-xl font-extrabold">{t("service.page.workflow")}</h2>
            <ul className="mt-2 grid gap-1 text-sm text-[var(--muted)]">
              {cfg.workflowKeys.map((lineKey, idx) => (
                <li key={lineKey}>{idx + 1}. {t(lineKey)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-extrabold">{t("service.page.audience")}</h2>
            <ul className="mt-2 grid gap-1 text-sm text-[var(--muted)]">
              {cfg.audienceKeys.map((lineKey) => (
                <li key={lineKey}>- {t(lineKey)}</li>
              ))}
            </ul>
          </div>
        </Card>
      </section>

      <Card className="grid gap-3">
        <div className="text-sm font-semibold text-[var(--muted)]">{t("service.page.ctaInfo")}</div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-[var(--ink)] hover:bg-[var(--brand-strong)]"
            to={`/search?q=${encodeURIComponent(cfg.query)}`}
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
