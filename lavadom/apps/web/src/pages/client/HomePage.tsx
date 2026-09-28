import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n";

type Slide = {
  key: string;
  tab: string;
  titleTop: string;
  titleMid: string;
  titleBottom: string;
  cta: string;
  imageUrl: string;
};

function ServiceCard(props: {
  marker: string;
  title: string;
  desc: string;
  links: Array<{ label: string; to: string }>;
  circleImage: string;
}) {
  return (
    <article className="lv-service-card">
      <div className="lv-illus" aria-hidden>
        <div className="lv-illus-orb" style={{ backgroundImage: `url('${props.circleImage}')` }} />
        <div className="lv-illus-wave" />
        <span className="lv-illus-marker">{props.marker}</span>
      </div>
      <div>
        <h3 className="text-2xl font-extrabold leading-tight">{props.title}</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">{props.desc}</p>
        <div className="lv-link-list">
          {props.links.map((l) => (
            <Link key={`${props.marker}-${l.label}`} to={l.to} className="hover:underline">
              {l.label} ›
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const { t } = useI18n();
  const [idx, setIdx] = useState(0);

  const slides: Slide[] = useMemo(
    () => [
      {
        key: "auto",
        tab: t("home.hero.1.tab"),
        titleTop: t("home.hero.1.top"),
        titleMid: t("home.hero.1.mid"),
        titleBottom: t("home.hero.1.bottom"),
        cta: t("home.hero.1.cta"),
        imageUrl: "/images/hero-carwash.jpg"
      },
      {
        key: "tapis",
        tab: t("home.hero.2.tab"),
        titleTop: t("home.hero.2.top"),
        titleMid: t("home.hero.2.mid"),
        titleBottom: t("home.hero.2.bottom"),
        cta: t("home.hero.2.cta"),
        imageUrl: "/images/hero-carpet.jpg"
      },
      {
        key: "blankets",
        tab: t("home.hero.3.tab"),
        titleTop: t("home.hero.3.top"),
        titleMid: t("home.hero.3.mid"),
        titleBottom: t("home.hero.3.bottom"),
        cta: t("home.hero.3.cta"),
        imageUrl: "/images/hero-laundry.jpg"
      },
      {
        key: "kyc",
        tab: t("home.hero.4.tab"),
        titleTop: t("home.hero.4.top"),
        titleMid: t("home.hero.4.mid"),
        titleBottom: t("home.hero.4.bottom"),
        cta: t("home.hero.4.cta"),
        imageUrl: "/images/hero-booking.jpg"
      }
    ],
    [t]
  );

  const current = slides[idx];

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((v) => (v + 1) % slides.length);
    }, 6500);
    return () => clearInterval(id);
  }, [slides.length]);

  function prev() {
    setIdx((v) => (v - 1 + slides.length) % slides.length);
  }

  function next() {
    setIdx((v) => (v + 1) % slides.length);
  }

  return (
    <div className="grid gap-6">
      <section
        id="hero"
        className="lv-hero"
        style={{
          background:
            `linear-gradient(105deg, rgba(8, 11, 16, 0.75) 0%, rgba(8, 11, 16, 0.32) 45%, rgba(8, 11, 16, 0.15) 100%), url('${current.imageUrl}') center/cover no-repeat`
        }}
      >
        <div className="lv-hero-content">
          <h1 className="page-title">
            <span className="lv-highlight">{current.titleTop}</span>
            <br />
            {current.titleMid}
            <br />
            {current.titleBottom}
          </h1>
          <div className="mt-5 flex items-center gap-2">
            <Link className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-extrabold text-white hover:bg-[var(--brand-strong)]" to="/search">
              {current.cta}
            </Link>
            <button className="rounded-xl border border-white/50 bg-black/20 px-3 py-2 text-sm font-bold text-white" onClick={prev}>‹</button>
            <button className="rounded-xl border border-white/50 bg-black/20 px-3 py-2 text-sm font-bold text-white" onClick={next}>›</button>
          </div>
        </div>

        <div className="lv-hero-tabs">
          {slides.map((s, i) => (
            <button key={s.key} className={`lv-tab ${i === idx ? "is-active" : ""}`} onClick={() => setIdx(i)}>
              {s.tab}
            </button>
          ))}
        </div>
      </section>
      <div id="hero-end-marker" aria-hidden style={{ height: 1, width: "100%" }} />

      <section id="services" className="lv-services">
        <div className="text-center">
          <span className="lv-pill">{t("home.app.pill")}</span>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.7rem)] font-extrabold leading-[1.02]">{t("home.services.title")}</h2>
        </div>

        <div className="lv-service-grid">
          <ServiceCard
            marker="01"
            title={t("home.service.auto.title")}
            desc={t("home.service.auto.desc")}
            links={[
              { label: t("home.link.clients"), to: "/search" },
              { label: t("home.link.providers"), to: "/register" }
            ]}
            circleImage="/images/service-auto.jpg"
          />
          <ServiceCard
            marker="02"
            title={t("home.service.carpet.title")}
            desc={t("home.service.carpet.desc")}
            links={[
              { label: t("home.link.home"), to: "/services/carpet-cleaning" },
              { label: t("home.link.business"), to: "/contact" }
            ]}
            circleImage="/images/service-carpet.jpg"
          />
          <ServiceCard
            marker="03"
            title={t("home.service.blanket.title")}
            desc={t("home.service.blanket.desc")}
            links={[
              { label: t("home.link.domestic"), to: "/services/blanket-laundry" },
              { label: t("home.link.press"), to: "/reservation-flow" }
            ]}
            circleImage="/images/service-laundry.jpg"
          />
          <ServiceCard
            marker="04"
            title={t("home.service.fabric.title")}
            desc={t("home.service.fabric.desc")}
            links={[
              { label: t("home.link.people"), to: "/search" },
              { label: t("home.link.pros"), to: "/contact" }
            ]}
            circleImage="/images/service-fabric.jpg"
          />
          <ServiceCard
            marker="05"
            title={t("home.service.booking.title")}
            desc={t("home.service.booking.desc")}
            links={[
              { label: t("home.link.providers"), to: "/provider" },
              { label: t("home.link.admins"), to: "/admin" }
            ]}
            circleImage="/images/service-kyc.jpg"
          />
        </div>
      </section>

      <section id="security" className="lv-security">
        <div className="text-center">
          <span className="lv-pill">{t("home.security.pill")}</span>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.3rem)] font-extrabold leading-[1.05]">{t("home.security.title")}</h2>
        </div>

        <div className="lv-security-card">
          <div className="lv-security-photo" />
          <div>
            <h3 className="text-4xl font-extrabold leading-tight">{t("home.security.cardTitle")}</h3>
            <p className="mt-3 text-sm text-[#1f2a1f]">{t("home.security.cardBody")}</p>
            <div className="mt-5">
              <Link to="/kyc-policy" className="inline-flex rounded-xl bg-[var(--ink)] px-4 py-2 text-sm font-extrabold text-white hover:bg-black">
                {t("home.security.cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="impact" className="lv-impact">
        <div className="lv-impact-crown" aria-hidden />
        <div className="lv-impact-content">
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-extrabold leading-[1.02]">
            {t("home.impact.title")}
          </h2>
          <p className="mt-4 text-[clamp(1rem,2.2vw,1.45rem)] font-semibold text-[#1c2b58]">
            {t("home.impact.body")}
          </p>
          <div className="mt-8">
            <Link
              to="/reservation-flow"
              className="inline-flex rounded-2xl bg-[#111827] px-6 py-3 text-sm font-extrabold text-white hover:bg-black"
            >
              {t("home.impact.cta")}
            </Link>
          </div>
        </div>
      </section>

      <section id="news" className="lv-news">
        <h2 className="text-[clamp(1.7rem,4vw,3rem)] font-extrabold leading-[1.05]">{t("home.news.title")}</h2>
        <div className="lv-news-grid">
          <article className="lv-news-card">
            <div className="p-4">
              <div className="text-xs font-semibold text-[var(--muted)]">{t("home.news.tag")}</div>
              <div className="mt-2 text-2xl font-extrabold leading-tight">{t("home.news.launch.title")}</div>
              <p className="mt-2 text-sm text-[var(--muted)]">{t("home.news.launch.desc")}</p>
            </div>
          </article>

          <article className="lv-news-card">
            <div className="p-4">
              <div className="text-xs font-semibold text-[var(--muted)]">{t("home.news.tag")}</div>
              <div className="mt-2 text-2xl font-extrabold leading-tight">{t("home.news.features.title")}</div>
              <ul className="mt-3 grid gap-1 text-sm text-[var(--muted)]">
                <li>- {t("home.news.features.1")}</li>
                <li>- {t("home.news.features.2")}</li>
                <li>- {t("home.news.features.3")}</li>
                <li>- {t("home.news.features.4")}</li>
              </ul>
            </div>
          </article>

          <article className="lv-news-card">
            <div className="p-4">
              <div className="text-xs font-semibold text-[var(--muted)]">{t("home.news.tag")}</div>
              <div className="mt-2 text-2xl font-extrabold leading-tight">{t("home.news.1")}</div>
              <p className="mt-2 text-sm text-[var(--muted)]">{t("home.news.2")}</p>
            </div>
          </article>

          <article className="rounded-[14px] bg-[#0d1528] p-6 text-white">
            <div className="text-2xl font-extrabold leading-tight">{t("home.news.4.title")}</div>
            <div className="mt-5">
              <Link to="/booking-and-kyc" className="inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-extrabold text-white">{t("home.news.4.cta")}</Link>
            </div>
          </article>
        </div>
      </section>

      <footer id="site-footer" className="lv-footer">
        <div className="lv-footer-grid">
          <div>
            <div className="text-4xl font-extrabold">Lavadom</div>
            <p className="mt-3 text-sm text-[var(--muted)]">{t("home.footer.about")}</p>
          </div>

          <div className="lv-footer-col">
            <b>{t("home.footer.services")}</b>
            <Link to="/services/car-wash">{t("home.service.auto.title")}</Link>
            <Link to="/services/carpet-cleaning">{t("home.service.carpet.title")}</Link>
            <Link to="/services/blanket-laundry">{t("home.service.blanket.title")}</Link>
            <Link to="/search">{t("home.service.fabric.title")}</Link>
          </div>

          <div className="lv-footer-col">
            <b>{t("home.footer.earn")}</b>
            <Link to="/register">{t("home.footer.become")}</Link>
            <Link to="/booking-and-kyc">{t("home.footer.kyc")}</Link>
            <Link to="/contact">{t("home.footer.partner")}</Link>
          </div>

          <div className="lv-footer-col">
            <b>{t("home.footer.security")}</b>
            <Link to="/kyc-policy">{t("home.footer.policy")}</Link>
            <Link to="/reservation-flow">{t("home.footer.data")}</Link>
            <Link to="/contact">{t("home.footer.report")}</Link>
          </div>

          <div className="lv-footer-col">
            <b>{t("home.footer.company")}</b>
            <Link to="/reservation-flow">{t("home.footer.aboutLink")}</Link>
            <Link to="/register">{t("home.footer.careers")}</Link>
            <Link to="/contact">{t("home.footer.contact")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

