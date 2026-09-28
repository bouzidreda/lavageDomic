import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useI18n } from "../../i18n";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit() {
    setBusy(true);
    try {
      await forgotPassword({ email });
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="max-w-md">
      <div className="text-xl font-bold">{t("auth.forgot.title")}</div>
      <div className="mt-2 text-sm text-neutral-600">{t("auth.forgot.subtitle")}</div>
      <div className="mt-3 grid gap-2">
        <Input placeholder={t("auth.register.email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button disabled={!email || busy} onClick={onSubmit}>
          {busy ? "..." : t("auth.forgot.submit")}
        </Button>
        {done ? <div className="text-sm text-blue-700">{t("auth.forgot.done")}</div> : null}
        <Link to="/login" className="text-sm underline">
          {t("auth.forgot.back")}
        </Link>
      </div>
    </Card>
  );
}
