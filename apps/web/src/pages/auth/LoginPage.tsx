import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "../../api/auth";
import { authStore } from "../../store/auth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit() {
    setBusy(true);
    setErr(null);
    try {
      const res = await login({ phone, password });
      authStore.setTokens(res.tokens);
      nav(loc.state?.from ?? "/");
    } catch {
      setErr("Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="max-w-md">
      <div className="text-xl font-bold">Login</div>
      <div className="mt-3 grid gap-2">
        <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err ? <div className="text-sm text-red-600">{err}</div> : null}
        <Button disabled={busy || !phone || !password} onClick={onSubmit}>{busy ? "..." : "Login"}</Button>
        <div className="text-sm">
          <Link className="underline" to="/register">Create account</Link>
        </div>
      </div>
    </Card>
  );
}
