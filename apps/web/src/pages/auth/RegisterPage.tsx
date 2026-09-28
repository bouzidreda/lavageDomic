import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../api/auth";
import { authStore } from "../../store/auth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Card } from "../../components/ui/Card";

export default function RegisterPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "PROVIDER">("CLIENT");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit() {
    setBusy(true);
    setErr(null);
    try {
      const res = await register({ name, phone, password, role });
      authStore.setTokens(res.tokens);
      nav("/");
    } catch {
      setErr("Register failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="max-w-md">
      <div className="text-xl font-bold">Register</div>
      <div className="mt-3 grid gap-2">
        <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Select value={role} onChange={(e) => setRole(e.target.value as any)}>
          <option value="CLIENT">Client</option>
          <option value="PROVIDER">Service provider</option>
        </Select>
        {err ? <div className="text-sm text-red-600">{err}</div> : null}
        <Button disabled={busy || !name || !phone || !password} onClick={onSubmit}>{busy ? "..." : "Create"}</Button>
        <div className="text-sm">
          <Link className="underline" to="/login">Login</Link>
        </div>
      </div>
    </Card>
  );
}
