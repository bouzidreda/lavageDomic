import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { providerBookings } from "../../api/bookings";
import { myProviderProfile, updateProviderProfile } from "../../api/providers";
import { listProviderReviews } from "../../api/reviews";
import { Card } from "../../components/ui/Card";
import { useI18n } from "../../i18n";

export default function ProviderDashboardPage() {
  const { t } = useI18n();
  const qProfile = useQuery({ queryKey: ["providerMe"], queryFn: myProviderProfile });
  const qBookings = useQuery({ queryKey: ["providerBookings"], queryFn: providerBookings });
  const providerId = qProfile.data?.provider.id;
  const qReviews = useQuery({
    queryKey: ["providerReviews", providerId],
    queryFn: () => listProviderReviews(providerId!),
    enabled: !!providerId
  });
  const mStatus = useMutation({
    mutationFn: (availabilityStatus: "AVAILABLE" | "OFFLINE") => updateProviderProfile({ availabilityStatus }),
    onSuccess: () => qProfile.refetch()
  });

  const stats = useMemo(() => {
    const items = qBookings.data?.items ?? [];
    const total = items.length;
    const active = items.filter((b) => ["REQUESTED", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"].includes(b.status)).length;
    const done = items.filter((b) => b.status === "DONE").length;
    const paid = items.filter((b) => b.paymentStatus === "PAID").reduce((sum, b) => sum + b.providerAmount, 0);
    return { total, active, done, paid };
  }, [qBookings.data?.items]);

  if (qProfile.isLoading || qBookings.isLoading) return <div>{t("common.loading")}</div>;
  const p = qProfile.data?.provider;
  if (!p) return <div>{t("common.notFound")}</div>;

  const recentReviews = qReviews.data?.items.slice(0, 3) ?? [];

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-[#d2e8d9] bg-[linear-gradient(145deg,#f1fff4_0%,#dff8e8_55%,#e9fff1_100%)] p-5 md:p-7">
        <div className="kicker text-[#2f6a4c]">{t("provider.dashboard.kicker")}</div>
        <h1 className="mt-2 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.04] text-[#174c35]">{t("provider.dashboard.title")}</h1>
        <p className="mt-2 text-sm text-[#2f6a4c]">{t("provider.dashboard.verification")} {p.verificationStatus}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-[#2f6a4c]">{t("provider.status.label")}:</span>
          <button
            className={`rounded-lg border px-3 py-1.5 text-xs font-extrabold ${p.availabilityStatus === "AVAILABLE" ? "border-[#2a8c5a] bg-[#d8f6e6] text-[#1d5f3d]" : "border-[#cbd9cf] bg-white text-[#365b48]"}`}
            disabled={mStatus.isPending}
            onClick={() => mStatus.mutate("AVAILABLE")}
          >
            {t("provider.status.available")}
          </button>
          <button
            className={`rounded-lg border px-3 py-1.5 text-xs font-extrabold ${p.availabilityStatus === "OFFLINE" ? "border-[#8d4e4e] bg-[#fbe3e3] text-[#6a2f2f]" : "border-[#cbd9cf] bg-white text-[#365b48]"}`}
            disabled={mStatus.isPending}
            onClick={() => mStatus.mutate("OFFLINE")}
          >
            {t("provider.status.offline")}
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Card className="border-[#d0ead8] bg-white">
          <div className="text-xs font-bold uppercase tracking-wide text-[#3e7a59]">{t("provider.dashboard.stat.total")}</div>
          <div className="mt-1 text-3xl font-extrabold text-[#1e5c40]">{stats.total}</div>
        </Card>
        <Card className="border-[#c9e4cf] bg-[#f3fff6]">
          <div className="text-xs font-bold uppercase tracking-wide text-[#3e7a59]">{t("provider.dashboard.stat.active")}</div>
          <div className="mt-1 text-3xl font-extrabold text-[#1e5c40]">{stats.active}</div>
        </Card>
        <Card className="border-[#c9e4cf] bg-[#f3fff6]">
          <div className="text-xs font-bold uppercase tracking-wide text-[#3e7a59]">{t("provider.dashboard.stat.done")}</div>
          <div className="mt-1 text-3xl font-extrabold text-[#1e5c40]">{stats.done}</div>
        </Card>
        <Card className="border-[#b9dbca] bg-[#ecfff2]">
          <div className="text-xs font-bold uppercase tracking-wide text-[#2f6a4c]">{t("provider.dashboard.stat.earnings")}</div>
          <div className="mt-1 text-3xl font-extrabold text-[#11432f]">{stats.paid.toFixed(0)} MAD</div>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Card className="border-[#cfe6d6]">
          <h2 className="text-xl font-extrabold text-[#1d563d]">{t("provider.dashboard.performance")}</h2>
          <ul className="mt-3 grid gap-1 text-sm text-[#396a54]">
            <li>{t("provider.dashboard.rating")} {p.ratingAvg.toFixed(2)} ({p.ratingCount})</li>
            <li>{t("provider.dashboard.radius")} {p.radiusKm} km</li>
            <li>{t("provider.dashboard.priceFrom")} {p.priceFrom} MAD</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-xl bg-[#1f7c4f] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#19653f]" to="/provider/bookings">
              {t("menu.link.providerRequests")}
            </Link>
            <Link className="rounded-xl border border-[#c6dacb] bg-white px-4 py-2.5 text-sm font-extrabold text-[#1e5b40] hover:bg-[#ecfff3]" to="/provider/profile">
              {t("provider.profile.title")}
            </Link>
          </div>
        </Card>

        <Card className="border-[#cfe6d6]">
          <h2 className="text-xl font-extrabold text-[#1d563d]">{t("provider.dashboard.reviews")}</h2>
          <div className="mt-3 grid gap-2 text-sm text-[#396a54]">
            {recentReviews.length === 0 ? <div>{t("review.list.empty")}</div> : null}
            {recentReviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-[#d8eade] bg-white p-2">
                <div className="font-semibold">{t("review.form.rating")} {r.rating}/5</div>
                <div className="text-xs text-[#557b66]">{r.comment ?? "-"}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
