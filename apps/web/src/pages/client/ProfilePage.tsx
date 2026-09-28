import { useMutation, useQuery } from "@tanstack/react-query";
import { me, updateMe } from "../../api/me";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useState } from "react";

export default function ProfilePage() {
  const q = useQuery({ queryKey: ["me"], queryFn: me });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const m = useMutation({
    mutationFn: () => updateMe({ name: name.trim() || undefined, phone: phone.trim() || undefined })
  });

  if (q.isLoading) return <div>Loading...</div>;
  const u = q.data?.user;
  if (!u) return <div>Not found</div>;

  return (
    <Card className="max-w-md">
      <div className="text-xl font-bold">My profile</div>
      <div className="mt-2 text-sm text-neutral-600">Role: {u.role}</div>
      <div className="mt-3 grid gap-2">
        <Input defaultValue={u.name} placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <Input defaultValue={u.phone} placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />
        <Button disabled={m.isPending} onClick={() => m.mutate()}>{m.isPending ? "..." : "Save"}</Button>
      </div>
    </Card>
  );
}
