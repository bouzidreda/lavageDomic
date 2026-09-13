import { Link, useNavigate } from "react-router-dom";
import { authStore } from "../../store/auth";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n";
import { parseJwt } from "../../lib/validators";
import { logout } from "../../api/auth";

type MenuSection = "services" | "earn" | "account" | "safety" | "about";
type MenuItem = { label: string; to?: string; href?: string };
type MenuCol = { title: string; items: MenuItem[] };

export function TopBar() {
  const nav = useNavigate();
  const authed = authStore.isAuthed();
  const token = authStore.getAccessToken();
  const role = token ? parseJwt(token)?.role : null;
  const { lang, setLang, t } = useI18n();
  const isRtl = lang === "ar";
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSection>("services");
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  function selectLang(next: "fr" | "en" | "ar") {
    setLang(next);
    setOpen(false);
  }

  const langLabel = lang === "fr" ? "Fr" : lang === "en" ? "En" : "Ar";
  const roleHome = role === "ADMIN" ? "/admin" : role === "PROVIDER" ? "/provider" : role === "CLIENT" ? "/client" : "/";

  async function onLogout() {
    try {
      await logout();
    } catch {}
    authStore.clear();
    setMenuOpen(false);
    nav("/login");
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuWrapRef.current) return;
      if (!menuWrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const defaultSectionTabs: Array<{ key: MenuSection; label: string }> = [
    { key: "services", label: t("menu.section.services") },
    { key: "earn", label: t("menu.section.earn") },
    { key: "account", label: t("menu.section.account") },
    { key: "safety", label: t("menu.section.safety") },
    { key: "about", label: t("menu.section.about") }
  ];

  const defaultDynamicCols: Record<MenuSection, MenuCol[]> = {
    services: [
      {
        title: t("menu.title.services"),
        items: [
          { label: t("menu.link.findServices"), to: "/search" },
          { label: t("menu.link.home"), to: "/" },
          { label: t("menu.link.reservationFlow"), to: "/reservation-flow" }
        ]
      },
      {
        title: t("menu.title.services2"),
        items: [
          { label: t("home.service.auto.title"), to: "/services/car-wash" },
          { label: t("home.service.carpet.title"), to: "/services/carpet-cleaning" },
          { label: t("home.service.blanket.title"), to: "/services/blanket-laundry" }
        ]
      },
      {
        title: t("menu.title.platform"),
        items: [
          { label: t("home.service.booking.title"), to: "/booking-and-kyc" },
          { label: t("menu.link.kycPolicy"), to: "/kyc-policy" },
          { label: t("menu.link.contact"), to: "/contact" }
        ]
      }
    ],
    earn: [
      {
        title: t("menu.title.earn"),
        items: [
          { label: t("home.footer.become"), to: "/register" },
          { label: t("home.footer.partner"), to: "/contact" },
          { label: t("home.footer.kyc"), to: "/booking-and-kyc" }
        ]
      },
      {
        title: t("menu.title.account"),
        items: authed
          ? [
              { label: role === "ADMIN" ? t("menu.link.adminOps") : role === "PROVIDER" ? t("menu.link.providerDashboard") : t("menu.link.clientDashboard"), to: roleHome },
              { label: t("menu.link.profile"), to: "/me" },
              { label: t("menu.link.myBookings"), to: "/bookings" }
            ]
          : [
              { label: t("menu.link.register"), to: "/register" },
              { label: t("menu.link.login"), to: "/login" }
            ]
      },
      {
        title: t("menu.title.platform"),
        items: [
          { label: t("menu.link.providerDashboard"), to: "/provider" },
          { label: t("menu.link.providerRequests"), to: "/provider/bookings" },
          { label: t("menu.link.adminOps"), to: "/admin" }
        ]
      }
    ],
    account: [
      {
        title: t("menu.title.account"),
        items: authed
          ? [
              { label: t("menu.link.profile"), to: "/me" },
              { label: t("menu.link.myBookings"), to: "/bookings" }
            ]
          : [
              { label: t("menu.link.login"), to: "/login" },
              { label: t("menu.link.register"), to: "/register" }
            ]
      },
      {
        title: t("menu.title.providerArea"),
        items: [
          { label: t("menu.link.providerDashboard"), to: "/provider" },
          { label: t("menu.link.providerRequests"), to: "/provider/bookings" }
        ]
      },
      {
        title: t("menu.title.adminArea"),
        items: [{ label: t("menu.link.adminOps"), to: "/admin" }]
      }
    ],
    safety: [
      {
        title: t("menu.title.safety"),
        items: [
          { label: t("home.security.title"), to: "/kyc-policy" },
          { label: t("home.footer.policy"), to: "/booking-and-kyc" },
          { label: t("home.footer.data"), to: "/reservation-flow" }
        ]
      },
      {
        title: t("menu.title.trust"),
        items: [
          { label: t("home.service.booking.title"), to: "/search" },
          { label: t("menu.link.kycPolicy"), to: "/kyc-policy" }
        ]
      },
      {
        title: t("menu.title.support"),
        items: [
          { label: t("home.footer.partner"), to: "/register" },
          { label: t("menu.link.contact"), to: "/contact" }
        ]
      }
    ],
    about: [
      {
        title: t("menu.title.about"),
        items: [
          { label: t("home.footer.aboutLink"), to: "/reservation-flow" },
          { label: t("home.footer.careers"), to: "/register" },
          { label: t("home.footer.contact"), to: "/contact" }
        ]
      },
      {
        title: t("menu.title.news"),
        items: [
          { label: t("home.news.launch.title"), to: "/reservation-flow" },
          { label: t("home.news.features.title"), to: "/booking-and-kyc" }
        ]
      },
      {
        title: t("menu.title.platform"),
        items: [
          { label: t("home.footer.services"), to: "/search" },
          { label: t("home.footer.security"), to: "/kyc-policy" }
        ]
      }
    ]
  };

  const providerOnlyTabs: Array<{ key: MenuSection; label: string }> = [{ key: "account", label: t("menu.title.providerArea") }];
  const providerOnlyCols: Record<MenuSection, MenuCol[]> = {
    ...defaultDynamicCols,
    account: [
      {
        title: t("menu.title.providerArea"),
        items: [
          { label: t("menu.link.providerDashboard"), to: "/provider" },
          { label: t("menu.link.providerRequests"), to: "/provider/bookings" },
          { label: t("provider.profile.title"), to: "/provider/profile" }
        ]
      },
      {
        title: t("menu.title.services"),
        items: [
          { label: t("menu.link.findServices"), to: "/search" },
          { label: t("menu.link.myBookings"), to: "/bookings" }
        ]
      },
      {
        title: t("menu.title.platform"),
        items: [
          { label: t("menu.link.profile"), to: "/me" },
          { label: t("menu.link.contact"), to: "/contact" },
          { label: t("menu.link.kycPolicy"), to: "/kyc-policy" }
        ]
      }
    ]
  };

  const sectionTabs = role === "PROVIDER" ? providerOnlyTabs : defaultSectionTabs;
  const dynamicCols = role === "PROVIDER" ? providerOnlyCols : defaultDynamicCols;

  return (
    <header className={`top-nav ${menuOpen ? "menu-open" : ""}`}>
      <div ref={menuWrapRef} className="site-wrap py-3">
        <div className="top-nav-inner">
          <Link to={authed ? roleHome : "/"} className="top-nav-logo flex items-center gap-2">
            <div className="top-nav-badge grid h-9 w-9 place-items-center rounded-lg text-sm font-extrabold">LD</div>
            <div className="top-nav-brand-text font-extrabold leading-none tracking-tight">{t("topbar.brand")}</div>
          </Link>

          <div className="top-nav-actions flex items-center gap-2" style={{ marginInlineStart: "auto" }}>
            <Link
              to={authed ? roleHome : "/register"}
              className="rounded-full bg-[var(--brand)] px-3 py-2 text-xs font-extrabold text-[var(--ink)] md:px-5 md:text-sm"
            >
              {authed ? t("topbar.cta.dashboard") : t("topbar.cta.guest")}
            </Link>

            <button
              className="top-nav-chip"
              onClick={() => {
                setMenuOpen((v) => {
                  const next = !v;
                  if (next) setActiveSection(role === "PROVIDER" ? "account" : "services");
                  return next;
                });
              }}
            >
              {menuOpen ? t("topbar.close") : t("topbar.menu")}
            </button>
            <div className="relative">
              <button
                className="top-nav-chip"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
              >
                {langLabel}
              </button>
              {open ? (
                <div className={`absolute mt-2 w-32 rounded-xl border border-[var(--border)] bg-white p-1 shadow-lg ${isRtl ? "left-0" : "right-0"}`} role="menu">
                  <button className="block w-full rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-soft)]" style={{ textAlign: "start" }} onClick={() => selectLang("fr")}>{t("topbar.lang.fr")}</button>
                  <button className="block w-full rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-soft)]" style={{ textAlign: "start" }} onClick={() => selectLang("en")}>{t("topbar.lang.en")}</button>
                  <button className="block w-full rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-soft)]" style={{ textAlign: "start" }} onClick={() => selectLang("ar")}>{t("topbar.lang.ar")}</button>
                </div>
              ) : null}
            </div>
            {authed ? (
              <button className="top-nav-chip top-nav-chip-danger" onClick={onLogout}>
                {t("topbar.logout")}
              </button>
            ) : null}
          </div>
        </div>

        {menuOpen ? (
          <div className="menu-overlay">
            <div className="menu-overlay-head">
              {sectionTabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`menu-tab ${activeSection === tab.key ? "is-active" : ""}`}
                  onMouseEnter={() => setActiveSection(tab.key)}
                  onFocus={() => setActiveSection(tab.key)}
                  onClick={() => setActiveSection(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="menu-panels">
              {sectionTabs.map((tab) => (
                <div
                  key={tab.key}
                  className={`menu-overlay-grid menu-panel ${activeSection === tab.key ? "is-active" : ""}`}
                  aria-hidden={activeSection === tab.key ? "false" : "true"}
                >
                  {dynamicCols[tab.key].map((col) => (
                    <div key={`${tab.key}-${col.title}`}>
                      <div className="menu-col-title">{col.title}</div>
                      <div className="menu-col-links">
                        {col.items.map((item) => {
                          if (item.to) {
                            if (item.to.startsWith("/provider") && !(role === "PROVIDER" || role === "ADMIN")) return null;
                            if (item.to === "/admin" && role !== "ADMIN") return null;
                            return <Link key={`${col.title}-${item.label}`} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}</Link>;
                          }

                          return <a key={`${col.title}-${item.label}`} href={item.href ?? "#"} onClick={(e) => e.preventDefault()}>{item.label}</a>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
