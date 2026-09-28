import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "../../api/auth";
import { authStore } from "../../store/auth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { useI18n } from "../../i18n";
import { parseJwt } from "../../lib/validators";
import { ApiError } from "../../api/client";

export default function LoginPage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const loc = useLocation() as any;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [suspendPopup, setSuspendPopup] = useState<{ reason: string | null } | null>(null);

  async function onSubmit() {
    setBusy(true);
    setErr(null);
    setSuspendPopup(null);
    try {
      const res = await login({ identifier, password });
      authStore.setTokens(res.tokens);
      const role = parseJwt(res.tokens.accessToken)?.role as "ADMIN" | "PROVIDER" | "CLIENT" | undefined;
      const roleHome = role === "ADMIN" ? "/admin" : role === "PROVIDER" ? "/provider" : "/client";
      nav(loc.state?.from ?? roleHome);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        const payload = e.payload as { error?: string; details?: { reason?: string | null } } | null;
        if (payload?.error === "ACCOUNT_SUSPENDED") {
          const reason = payload.details?.reason?.trim() || null;
          setSuspendPopup({ reason });
          return;
        }
      }
      setErr(t("auth.login.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      {suspendPopup ? (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#f1c9c9] bg-white p-5 shadow-2xl">
            <h2 className="text-xl font-extrabold text-[#742f2f]">{t("auth.login.suspended.title")}</h2>
            <p className="mt-2 text-sm text-[#5f4a4a]">{t("auth.login.suspended.message")}</p>
            <div className="mt-3 rounded-lg border border-[#f3d3d3] bg-[#fff2f2] p-3 text-sm text-[#6e2f2f]">
              <div className="font-bold">{t("auth.login.suspended.reason")}</div>
              <div className="mt-1">{suspendPopup.reason ?? t("auth.login.suspended.noReason")}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="rounded-xl bg-[#c54b4b] px-4 py-2 text-sm font-extrabold text-white" to="/contact" onClick={() => setSuspendPopup(null)}>
                {t("auth.login.suspended.contact")}
              </Link>
              <Button variant="ghost" onClick={() => setSuspendPopup(null)}>{t("auth.login.suspended.close")}</Button>
            </div>
          </div>
        </div>
      ) : null}
      <Card>
        <div className="kicker">{t("auth.login.kicker")}</div>
        <h1 className="page-title">{t("auth.login.title")}</h1>
        <div className="mt-4 grid gap-2">
          <Input placeholder={t("auth.login.identifier")} value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          <Input placeholder={t("auth.login.password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {err ? <div className="text-sm text-red-600">{err}</div> : null}
          <Button className="w-full" disabled={busy || !identifier || !password} onClick={onSubmit}>{busy ? "..." : t("auth.login.submit")}</Button>
          <div className="pt-1 text-sm text-[var(--muted)]">
            {t("auth.login.new")} <Link className="font-bold underline" to="/register">{t("auth.login.create")}</Link>
          </div>
          <div className="text-sm text-[var(--muted)]">
            <Link className="font-bold underline" to="/forgot-password">{t("auth.login.forgot")}</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

