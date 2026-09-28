import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../api/auth";
import { authStore } from "../../store/auth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Card } from "../../components/ui/Card";
import { Textarea } from "../../components/ui/Textarea";
import { useI18n } from "../../i18n";

type ProviderDocType = "NATIONAL_ID" | "DRIVING_LICENSE" | "PASSPORT" | "OWNERSHIP_PAPER";

type DocDraft = { type: ProviderDocType; label: string; payload: string };

export default function RegisterPage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "PROVIDER">("CLIENT");
  const [docs, setDocs] = useState<DocDraft[]>([{ type: "NATIONAL_ID", label: "", payload: "" }]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function updateDoc(index: number, patch: Partial<DocDraft>) {
    setDocs((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function addDoc() {
    setDocs((prev) => [...prev, { type: "DRIVING_LICENSE", label: "", payload: "" }]);
  }

  function removeDoc(index: number) {
    setDocs((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit() {
    setBusy(true);
    setErr(null);
    try {
      const providerDocuments =
        role === "PROVIDER"
          ? docs
              .filter((d) => d.payload.trim())
              .map((d) => ({ type: d.type, label: d.label.trim() || undefined, payload: d.payload.trim() }))
          : undefined;

      if (role === "PROVIDER" && (!providerDocuments || providerDocuments.length === 0)) {
        setErr(t("auth.register.docs.required"));
        setBusy(false);
        return;
      }

      const res = await register({ name, email, phone, password, role, providerDocuments });
      authStore.setTokens(res.tokens);
      nav("/");
    } catch {
      setErr(t("auth.register.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <div className="kicker">{t("auth.register.kicker")}</div>
        <h1 className="page-title">{t("auth.register.title")}</h1>
        <div className="mt-4 grid gap-2">
          <Input placeholder={t("auth.register.name")} value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder={t("auth.register.email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder={t("auth.register.phone")} value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder={t("auth.register.password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="CLIENT">{t("auth.register.client")}</option>
            <option value="PROVIDER">{t("auth.register.provider")}</option>
          </Select>

          {role === "PROVIDER" ? (
            <div className="mt-2 rounded-xl border border-[var(--border)] p-3">
              <div className="text-sm font-extrabold">{t("auth.register.docs.title")}</div>
              <div className="mt-1 text-xs text-[var(--muted)]">{t("auth.register.docs.help")}</div>

              <div className="mt-3 grid gap-3">
                {docs.map((d, i) => (
                  <div key={i} className="rounded-lg border border-[var(--border)] p-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Select value={d.type} onChange={(e) => updateDoc(i, { type: e.target.value as ProviderDocType })}>
                        <option value="NATIONAL_ID">{t("auth.register.docs.nationalId")}</option>
                        <option value="DRIVING_LICENSE">{t("auth.register.docs.driving")}</option>
                        <option value="PASSPORT">{t("auth.register.docs.passport")}</option>
                        <option value="OWNERSHIP_PAPER">{t("auth.register.docs.ownership")}</option>
                      </Select>
                      <Input
                        placeholder={t("auth.register.docs.label")}
                        value={d.label}
                        onChange={(e) => updateDoc(i, { label: e.target.value })}
                      />
                    </div>
                    <Textarea
                      className="mt-2"
                      rows={3}
                      placeholder={t("auth.register.docs.payload")}
                      value={d.payload}
                      onChange={(e) => updateDoc(i, { payload: e.target.value })}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button variant="ghost" type="button" onClick={() => removeDoc(i)} disabled={docs.length === 1}>
                        {t("auth.register.docs.remove")}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" type="button" onClick={addDoc}>{t("auth.register.docs.add")}</Button>
              </div>
            </div>
          ) : null}

          {err ? <div className="text-sm text-red-600">{err}</div> : null}
          <Button className="w-full" disabled={busy || !name || !email || !phone || !password} onClick={onSubmit}>{busy ? "..." : t("auth.register.submit")}</Button>
          <div className="pt-1 text-sm text-[var(--muted)]">
            {t("auth.register.have")} <Link className="font-bold underline" to="/login">{t("auth.register.login")}</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

