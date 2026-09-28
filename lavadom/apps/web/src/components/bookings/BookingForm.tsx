import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { useI18n } from "../../i18n";

export function BookingForm(props: {
  onSubmit: (v: { scheduledAt: string; address: string; notes?: string }) => void;
  busy?: boolean;
  blocked?: boolean;
}) {
  const { t } = useI18n();
  const [scheduledAt, setScheduledAt] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="grid gap-2">
      <div className="text-sm font-semibold">{t("booking.form.schedule")}</div>
      <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
      <div className="text-sm font-semibold mt-2">{t("booking.form.address")}</div>
      <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("booking.form.addressPlaceholder")} />
      <div className="text-sm font-semibold mt-2">{t("booking.form.notes")}</div>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("booking.form.optional")} rows={3} />
      <Button
        disabled={props.busy || props.blocked || !scheduledAt || !address}
        onClick={() => props.onSubmit({ scheduledAt, address, notes: notes.trim() ? notes : undefined })}
      >
        {props.busy ? t("booking.form.creating") : t("booking.form.confirm")}
      </Button>
    </div>
  );
}
