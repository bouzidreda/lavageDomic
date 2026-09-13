import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { myBookings } from "../../api/bookings";
import { listAddresses, listVehicles, me } from "../../api/me";
import { Card } from "../../components/ui/Card";
import { useI18n } from "../../i18n";

export default function ClientDashboardPage() {
  const { t } = useI18n();
  const qMe = useQuery({ queryKey: ["me"], queryFn: me });
  const qBookings = useQuery({ queryKey: ["myBookings"], queryFn: myBookings });
  const qAddresses = useQuery({ queryKey: ["myAddresses"], queryFn: listAddresses });
  const qVehicles = useQuery({ queryKey: ["myVehicles"], queryFn: listVehicles });

  const stats = useMemo(() => {
    const items = qBookings.data?.items ?? [];
    const total = items.length;
    const active = items.filter((b) => ["REQUESTED", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"].includes(b.status)).length;
    const done = items.filter((b) => b.status === "DONE").length;
    const spent = items.filter((b) => b.paymentStatus === "PAID").reduce((sum, b) => sum + b.totalPrice, 0);
    return { total, active, done, spent };
  }, [qBookings.data?.items]);

  if (qMe.isLoading || qBookings.isLoading || qAddresses.isLoading || qVehicles.isLoading) return <div>{t("common.loading")}</div>;
  const user = qMe.data?.user;
  if (!user) return <div>{t("common.notFound")}</div>;

  return (
    <div className="grid gap-4">
      <section className="rounded-[24px] border border-[#cdd8f4] bg-[linear-gradient(140deg,#f1f6ff_0%,#dfe9ff_45%,#e9f1ff_100%)] p-5 md:p-7">
        <div className="kicker">{t("client.dashboard.kicker")}</div>
        <h1 className="mt-2 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.04] text-[#102347]">{t("client.dashboard.title")}</h1>
        <p className="mt-2 text-sm text-[#314a73]">{user.name} - {user.email}</p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Card className="border-[#bfd0ff] bg-white">
          <div className="text-xs font-bold uppercase tracking-wide text-[#4c6592]">{t("client.dashboard.stat.total")}</div>
          <div className="mt-1 text-3xl font-extrabold text-[#122a56]">{stats.total}</div>
        </Card>
        <Card className="border-[#bdd7cc] bg-[#f4fff8]">
          <div className="text-xs font-bold uppercase tracking-wide text-[#356b55]">{t("client.dashboard.stat.active")}</div>
          <div className="mt-1 text-3xl font-extrabold text-[#1f5d45]">{stats.active}</div>
        </Card>
        <Card className="border-[#c9d2ea] bg-[#f9fbff]">
          <div className="text-xs font-bold uppercase tracking-wide text-[#546182]">{t("client.dashboard.stat.done")}</div>
          <div className="mt-1 text-3xl font-extrabold text-[#223154]">{stats.done}</div>
        </Card>
        <Card className="border-[#edd7b0] bg-[#fff9ef]">
          <div className="text-xs font-bold uppercase tracking-wide text-[#8a6020]">{t("client.dashboard.stat.spent")}</div>
          <div className="mt-1 text-3xl font-extrabold text-[#6f4b16]">{stats.spent.toFixed(0)} MAD</div>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Card className="border-[#ccd7f1]">
          <h2 className="text-xl font-extrabold text-[#122a56]">{t("client.dashboard.quick")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="rounded-xl bg-[#1f4fd1] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#183ea8]" to="/search">
              {t("menu.link.findServices")}
            </Link>
            <Link className="rounded-xl border border-[#bfcde9] bg-white px-4 py-2.5 text-sm font-extrabold text-[#172a54] hover:bg-[#eef4ff]" to="/bookings">
              {t("menu.link.myBookings")}
            </Link>
            <Link className="rounded-xl border border-[#bfcde9] bg-white px-4 py-2.5 text-sm font-extrabold text-[#172a54] hover:bg-[#eef4ff]" to="/me">
              {t("menu.link.profile")}
            </Link>
          </div>
        </Card>

        <Card className="border-[#ccd7f1]">
          <h2 className="text-xl font-extrabold text-[#122a56]">{t("client.dashboard.readiness")}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-[#44577f]">
            <li>{t("profile.vehicles")}: {qVehicles.data?.items.length ?? 0}</li>
            <li>{t("profile.addresses")}: {qAddresses.data?.items.length ?? 0}</li>
            <li>{t("profile.status")}: {user.accountStatus}</li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
