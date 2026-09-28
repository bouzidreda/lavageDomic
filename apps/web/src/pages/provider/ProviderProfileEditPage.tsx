import { useMutation, useQuery } from "@tanstack/react-query";
import { myProviderProfile, updateProviderProfile } from "../../api/providers";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { useState } from "react";

export default function ProviderProfileEditPage() {
  const q = useQuery({ queryKey: ["providerMe"], queryFn: myProviderProfile });
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radiusKm, setRadiusKm] = useState("");
  const [priceFrom, setPriceFrom] = useState("");

  const m = useMutation({
    mutationFn: () => updateProviderProfile({
      bio: bio.trim() || undefined,
      city: city.trim() || undefined,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      radiusKm: radiusKm ? Number(radiusKm) : undefined,
      priceFrom: priceFrom ? Number(priceFrom) : undefined
    })
  });

  if (q.isLoading) return <div>Loading...</div>;
  const p = q.data?.provider;
  if (!p) return <div>Not found</div>;

  return (
    <Card className="max-w-xl">
      <div className="text-xl font-bold">Provider profile</div>
      <div className="mt-3 grid gap-2">
        <Input defaultValue={p.city ?? ""} placeholder="City" onChange={(e) => setCity(e.target.value)} />
        <Textarea defaultValue={p.bio ?? ""} placeholder="Bio" rows={4} onChange={(e) => setBio(e.target.value)} />
        <div className="grid md:grid-cols-2 gap-2">
          <Input defaultValue={String(p.lat)} placeholder="Lat" onChange={(e) => setLat(e.target.value)} />
          <Input defaultValue={String(p.lng)} placeholder="Lng" onChange={(e) => setLng(e.target.value)} />
          <Input defaultValue={String(p.radiusKm)} placeholder="Radius km" onChange={(e) => setRadiusKm(e.target.value)} />
          <Input defaultValue={String(p.priceFrom)} placeholder="Price from" onChange={(e) => setPriceFrom(e.target.value)} />
        </div>
        <Button disabled={m.isPending} onClick={() => m.mutate()}>{m.isPending ? "..." : "Save"}</Button>
      </div>
    </Card>
  );
}
