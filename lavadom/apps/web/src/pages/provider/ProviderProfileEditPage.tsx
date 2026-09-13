import { useMutation, useQuery } from "@tanstack/react-query";
import { myProviderDocuments, myProviderProfile, updateProviderProfile } from "../../api/providers";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";

type WeekDay = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
const WEEK_DAYS: WeekDay[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

type AvailabilityPayload = {
  status?: "AVAILABLE" | "OFFLINE";
  schedule?: {
    timezone?: string;
    days?: WeekDay[];
    start?: string;
    end?: string;
  };
};

function parseAvailability(raw: string | null, fallbackStatus: "AVAILABLE" | "OFFLINE"): AvailabilityPayload {
  if (!raw) return { status: fallbackStatus };
  try {
    const parsed = JSON.parse(raw) as AvailabilityPayload;
    return {
      status: parsed?.status === "OFFLINE" ? "OFFLINE" : fallbackStatus,
      schedule: {
        timezone: parsed?.schedule?.timezone,
        days: Array.isArray(parsed?.schedule?.days)
          ? parsed.schedule.days.filter((d): d is WeekDay => WEEK_DAYS.includes(d as WeekDay))
          : undefined,
        start: parsed?.schedule?.start,
        end: parsed?.schedule?.end
      }
    };
  } catch {
    return { status: fallbackStatus };
  }
}

export default function ProviderProfileEditPage() {
  const { t } = useI18n();
  const q = useQuery({ queryKey: ["providerMe"], queryFn: myProviderProfile });
  const qDocs = useQuery({ queryKey: ["providerMeDocs"], queryFn: myProviderDocuments });

  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radiusKm, setRadiusKm] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<"AVAILABLE" | "OFFLINE">("AVAILABLE");
  const [timezone, setTimezone] = useState("Africa/Casablanca");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [activeDays, setActiveDays] = useState<WeekDay[]>(["MON", "TUE", "WED", "THU", "FRI", "SAT"]);

  useEffect(() => {
    if (!q.data?.provider) return;
    const parsed = parseAvailability(q.data.provider.availabilityJson, q.data.provider.availabilityStatus ?? "AVAILABLE");
    setAvailabilityStatus(parsed.status ?? "AVAILABLE");
    setTimezone(parsed.schedule?.timezone ?? "Africa/Casablanca");
    setStartTime(parsed.schedule?.start ?? "08:00");
    setEndTime(parsed.schedule?.end ?? "18:00");
    setActiveDays(parsed.schedule?.days?.length ? parsed.schedule.days : ["MON", "TUE", "WED", "THU", "FRI", "SAT"]);
  }, [q.data?.provider]);

  const m = useMutation({
    mutationFn: () =>
      updateProviderProfile({
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        radiusKm: radiusKm ? Number(radiusKm) : undefined,
        priceFrom: priceFrom ? Number(priceFrom) : undefined,
        availabilityStatus,
        availabilityJson: JSON.stringify({
          schedule: {
            timezone: timezone.trim() || "Africa/Casablanca",
            days: activeDays,
            start: startTime || "08:00",
            end: endTime || "18:00"
          }
        })
      }),
    onSuccess: () => q.refetch()
  });
  const mStatus = useMutation({
    mutationFn: (nextStatus: "AVAILABLE" | "OFFLINE") => updateProviderProfile({ availabilityStatus: nextStatus }),
    onSuccess: () => q.refetch()
  });

  function toggleDay(day: WeekDay) {
    setActiveDays((prev) => {
      if (prev.includes(day)) return prev.filter((d) => d !== day);
      return [...prev, day];
    });
  }

  if (q.isLoading) return <div>{t("common.loading")}</div>;
  const p = q.data?.provider;
  if (!p) return <div>{t("common.notFound")}</div>;

  return (
    <Card className="w-full max-w-4xl">
      <div className="text-xl font-bold">{t("provider.profile.title")}</div>
      <div className="mt-1 text-sm text-neutral-600">
        {t("provider.profile.verification")}: {p.verificationStatus}
      </div>

      <div className="mt-3 rounded-xl border border-[#cbe4d5] bg-[#f2fff8] p-3">
        <div className="text-xs font-bold uppercase tracking-wide text-[#3a6f54]">{t("provider.status.label")}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            className={`rounded-lg border px-3 py-2 text-sm font-extrabold ${
              availabilityStatus === "AVAILABLE" ? "border-[#2a8c5a] bg-[#d8f6e6] text-[#1d5f3d]" : "border-[#cbd9cf] bg-white text-[#365b48]"
            }`}
            disabled={mStatus.isPending}
            onClick={() => {
              if (availabilityStatus === "AVAILABLE") return;
              setAvailabilityStatus("AVAILABLE");
              mStatus.mutate("AVAILABLE");
            }}
          >
            {t("provider.status.available")}
          </button>
          <button
            className={`rounded-lg border px-3 py-2 text-sm font-extrabold ${
              availabilityStatus === "OFFLINE" ? "border-[#8d4e4e] bg-[#fbe3e3] text-[#6a2f2f]" : "border-[#cbd9cf] bg-white text-[#365b48]"
            }`}
            disabled={mStatus.isPending}
            onClick={() => {
              if (availabilityStatus === "OFFLINE") return;
              setAvailabilityStatus("OFFLINE");
              mStatus.mutate("OFFLINE");
            }}
          >
            {t("provider.status.offline")}
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        <Input defaultValue={p.city ?? ""} placeholder={t("profile.city")} onChange={(e) => setCity(e.target.value)} />
        <Textarea defaultValue={p.bio ?? ""} placeholder={t("provider.profile.bio")} rows={4} onChange={(e) => setBio(e.target.value)} />

        <div className="rounded-xl border border-[#dce5f6] bg-[#f8fbff] p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-[#3e5686]">{t("provider.profile.scheduleTitle")}</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <Input value={timezone} placeholder={t("provider.profile.timezone")} onChange={(e) => setTimezone(e.target.value)} />
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => (
              <button
                key={day}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-extrabold ${
                  activeDays.includes(day) ? "border-[#4b6ec6] bg-[#e8efff] text-[#233a76]" : "border-[#c9d5ef] bg-white text-[#4c5f8c]"
                }`}
                onClick={() => toggleDay(day)}
                type="button"
              >
                {t(`provider.profile.day.${day.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Input defaultValue={String(p.lat)} placeholder={t("provider.profile.lat")} onChange={(e) => setLat(e.target.value)} />
          <Input defaultValue={String(p.lng)} placeholder={t("provider.profile.lng")} onChange={(e) => setLng(e.target.value)} />
          <Input defaultValue={String(p.radiusKm)} placeholder={t("provider.dashboard.radius")} onChange={(e) => setRadiusKm(e.target.value)} />
          <Input defaultValue={String(p.priceFrom)} placeholder={t("provider.dashboard.priceFrom")} onChange={(e) => setPriceFrom(e.target.value)} />
        </div>
        <Button className="w-full sm:w-auto" disabled={m.isPending} onClick={() => m.mutate()}>
          {m.isPending ? "..." : t("common.save")}
        </Button>
      </div>

      <div className="mt-5 rounded-xl border border-[#e2e8f3] bg-[#f8fbff] p-3">
        <div className="text-sm font-extrabold text-[#1f315a]">{t("provider.profile.docsTitle")}</div>
        <div className="mt-2 grid gap-2">
          {qDocs.isLoading ? <div className="text-sm text-neutral-600">{t("common.loading")}</div> : null}
          {!qDocs.isLoading && (qDocs.data?.items.length ?? 0) === 0 ? <div className="text-sm text-neutral-600">{t("provider.profile.docsEmpty")}</div> : null}
          {(qDocs.data?.items ?? []).map((d) => (
            <div key={d.id} className="rounded-lg border border-[#d9e3f2] bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-bold text-[#1c2f59]">{d.type}</div>
                {d.label ? <div className="text-xs text-neutral-600">({d.label})</div> : null}
                <div className="ml-auto rounded-full border border-[#c7d5ec] bg-[#eef3ff] px-2 py-1 text-xs font-bold text-[#2b4472]">{d.status}</div>
              </div>
              <div className="mt-1 text-xs text-neutral-600">
                {t("provider.profile.docsUploadedAt")}: {new Date(d.createdAt).toLocaleString()}
              </div>
              {d.reviewedAt ? (
                <div className="text-xs text-neutral-600">
                  {t("provider.profile.docsReviewedAt")}: {new Date(d.reviewedAt).toLocaleString()}
                </div>
              ) : null}
              {d.rejectionReason ? <div className="mt-1 text-xs text-[#8a2f2f]">{t("provider.profile.docsReason")}: {d.rejectionReason}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
