import { useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useI18n } from "../../i18n";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const token = useMemo(() => sp.get("token") ?? "", [sp]);

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!token) {
      setError(t("auth.reset.errToken"));
      return;
    }
    if (newPassword.length < 8) {
      setError(t("auth.reset.errLength"));
      return;
    }
    if (newPassword !== confirm) {
      setError(t("auth.reset.errMismatch"));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await resetPassword({ token, newPassword });
      nav("/login", { replace: true });
    } catch {
      setError(t("auth.reset.errFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="max-w-md">
      <div className="text-xl font-bold">{t("auth.reset.title")}</div>
      <div className="mt-3 grid gap-2">
        <Input placeholder={t("auth.reset.newPassword")} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Input placeholder={t("auth.reset.confirmPassword")} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <Button disabled={busy || !newPassword || !confirm} onClick={onSubmit}>
          {busy ? "..." : t("auth.reset.submit")}
        </Button>
        <Link to="/login" className="text-sm underline">
          {t("auth.reset.back")}
        </Link>
      </div>
    </Card>
  );
}
