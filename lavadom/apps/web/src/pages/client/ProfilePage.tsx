import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteAddress,
  deleteVehicle,
  listAddresses,
  listVehicles,
  me,
  updateMe,
  upsertAddress,
  upsertVehicle
} from "../../api/me";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useState } from "react";
import { useI18n } from "../../i18n";

export default function ProfilePage() {
  const { t } = useI18n();
  const qMe = useQuery({ queryKey: ["me"], queryFn: me });
  const qAddresses = useQuery({ queryKey: ["myAddresses"], queryFn: listAddresses });
  const qVehicles = useQuery({ queryKey: ["myVehicles"], queryFn: listVehicles });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressLine, setAddressLine] = useState("");
  const [addressCity, setAddressCity] = useState("");

  const [vehicleLabel, setVehicleLabel] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");

  const mProfile = useMutation({ mutationFn: () => updateMe({ name: name || undefined, email: email || undefined, phone: phone || undefined }) });
  const mAddress = useMutation({ mutationFn: () => upsertAddress({ label: addressLabel, addressLine, city: addressCity || undefined, isDefault: true }) });
  const mVehicle = useMutation({
    mutationFn: () => upsertVehicle({ label: vehicleLabel, brand: vehicleBrand || undefined, model: vehicleModel || undefined })
  });

  if (qMe.isLoading) return <div>{t("common.loading")}</div>;
  const u = qMe.data?.user;
  if (!u) return <div>{t("common.notFound")}</div>;

  return (
    <div className="grid gap-3">
      <Card className="max-w-xl">
        <div className="text-xl font-bold">{t("profile.title")}</div>
        <div className="mt-1 text-sm text-neutral-600">{t("profile.role")}: {u.role}</div>
        <div className="mt-1 text-sm text-neutral-600">{t("profile.status")}: {u.accountStatus}</div>
        <div className="mt-3 grid gap-2">
          <Input defaultValue={u.name} placeholder={t("auth.register.name")} onChange={(e) => setName(e.target.value)} />
          <Input defaultValue={u.email} placeholder={t("auth.register.email")} onChange={(e) => setEmail(e.target.value)} />
          <Input defaultValue={u.phone} placeholder={t("auth.register.phone")} onChange={(e) => setPhone(e.target.value)} />
          <Button disabled={mProfile.isPending} onClick={() => mProfile.mutate()}>
            {mProfile.isPending ? "..." : t("profile.save")}
          </Button>
        </div>
      </Card>

      <Card className="max-w-xl">
        <div className="text-lg font-bold">{t("profile.addresses")}</div>
        <div className="mt-2 grid gap-2">
          {(qAddresses.data?.items ?? []).map((a) => (
            <div key={a.id} className="border rounded-lg p-2 text-sm flex gap-2 items-center">
              <div>
                <div className="font-semibold">{a.label}</div>
                <div>{a.addressLine}</div>
              </div>
              <Button className="ml-auto" variant="ghost" onClick={() => deleteAddress(a.id).then(() => qAddresses.refetch())}>
                {t("common.delete")}
              </Button>
            </div>
          ))}
          <Input value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} placeholder={t("profile.label")} />
          <Input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder={t("profile.addressLine")} />
          <Input value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder={t("profile.city")} />
          <Button
            disabled={mAddress.isPending || !addressLine}
            onClick={() =>
              mAddress.mutate(undefined, {
                onSuccess: () => {
                  setAddressLine("");
                  qAddresses.refetch();
                }
              })
            }
          >
            {mAddress.isPending ? "..." : t("profile.addAddress")}
          </Button>
        </div>
      </Card>

      <Card className="max-w-xl">
        <div className="text-lg font-bold">{t("profile.vehicles")}</div>
        <div className="mt-2 grid gap-2">
          {(qVehicles.data?.items ?? []).map((v) => (
            <div key={v.id} className="border rounded-lg p-2 text-sm flex gap-2 items-center">
              <div>
                <div className="font-semibold">{v.label}</div>
                <div className="text-neutral-600">{[v.brand, v.model].filter(Boolean).join(" ")}</div>
              </div>
              <Button className="ml-auto" variant="ghost" onClick={() => deleteVehicle(v.id).then(() => qVehicles.refetch())}>
                {t("common.delete")}
              </Button>
            </div>
          ))}
          <Input value={vehicleLabel} onChange={(e) => setVehicleLabel(e.target.value)} placeholder={t("profile.vehicleLabel")} />
          <Input value={vehicleBrand} onChange={(e) => setVehicleBrand(e.target.value)} placeholder={t("profile.brand")} />
          <Input value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder={t("profile.model")} />
          <Button
            disabled={mVehicle.isPending || !vehicleLabel}
            onClick={() =>
              mVehicle.mutate(undefined, {
                onSuccess: () => {
                  setVehicleLabel("");
                  qVehicles.refetch();
                }
              })
            }
          >
            {mVehicle.isPending ? "..." : t("profile.addVehicle")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
