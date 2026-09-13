import { Outlet } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { TopBar } from "./TopBar";

export function AppShell() {
  const location = useLocation();
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    window.requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;

    function setCollapsed(isCollapsed: boolean) {
      const isSmallViewport = window.innerWidth <= 1024;
      document.body.classList.toggle("mobile-nav-scrolled", isSmallViewport && isCollapsed);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setCollapsed(!entry.isIntersecting);
      },
      { root: null, threshold: 1, rootMargin: "-20px 0px 0px 0px" }
    );
    observer.observe(sentinel);

    function onResize() {
      const el = topSentinelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setCollapsed(rect.top < -20);
    }

    window.addEventListener("resize", onResize);
    onResize();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("mobile-nav-scrolled");
    };
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("home-hero-page", isHome);
    if (!isHome) {
      document.body.classList.remove("home-past-hero");
      document.documentElement.style.removeProperty("--home-hero-progress");
    }
    return () => {
      document.body.classList.remove("home-hero-page");
      document.body.classList.remove("home-past-hero");
      document.documentElement.style.removeProperty("--home-hero-progress");
    };
  }, [isHome]);

  useEffect(() => {
    if (!isHome) return;
    let rafId = 0;
    let ticking = false;
    let heroObserver: IntersectionObserver | null = null;

    function getScrollTop() {
      return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function setupHeroObserver() {
      const hero = document.getElementById("hero");
      const nav = document.querySelector<HTMLElement>(".top-nav");
      const navHeight = nav?.getBoundingClientRect().height ?? 0;

      if (heroObserver) {
        heroObserver.disconnect();
        heroObserver = null;
      }

      if (!hero) {
        document.body.classList.toggle("home-past-hero", getScrollTop() >= 260);
        return;
      }

      heroObserver = new IntersectionObserver(
        ([entry]) => {
          const pastHero = !entry.isIntersecting || entry.boundingClientRect.bottom <= navHeight + 1;
          document.body.classList.toggle("home-past-hero", pastHero);
        },
        {
          root: null,
          threshold: 0,
          rootMargin: `-${Math.round(navHeight)}px 0px 0px 0px`
        }
      );
      heroObserver.observe(hero);
    }

    function getHeroScrollState() {
      const marker = document.getElementById("hero-end-marker") ?? document.getElementById("services") ?? document.getElementById("hero");
      const nav = document.querySelector<HTMLElement>(".top-nav");
      const y = getScrollTop();
      const navHeight = nav?.getBoundingClientRect().height ?? 0;
      if (!marker) {
        const endThreshold = Math.max(1, window.innerHeight * 0.82);
        return { y, endThreshold, pastHero: y >= endThreshold };
      }

      const markerTop = marker.getBoundingClientRect().top;
      const endThreshold = Math.max(1, y + markerTop - navHeight);
      const pastHero = markerTop <= navHeight + 1;

      return { y, endThreshold, pastHero };
    }

    function writeProgress() {
      ticking = false;
      const { y, endThreshold, pastHero } = getHeroScrollState();
      const p = Math.min(1, Math.max(0, y / endThreshold));
      document.documentElement.style.setProperty("--home-hero-progress", p.toFixed(4));
      document.body.classList.toggle("home-past-hero", pastHero);
    }

    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      rafId = window.requestAnimationFrame(writeProgress);
    }

    function onResize() {
      setupHeroObserver();
      onScrollOrResize();
    }

    setupHeroObserver();
    writeProgress();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    document.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      document.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onResize);
      if (heroObserver) heroObserver.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isHome]);

  return (
    <div className="min-h-screen">
      <TopBar />
      <div ref={topSentinelRef} aria-hidden style={{ height: 1 }} />
      <div className={`site-wrap ${isHome ? "home-main-wrap" : "py-6 md:py-8"}`}>
        <Outlet />
      </div>
    </div>
  );
}
