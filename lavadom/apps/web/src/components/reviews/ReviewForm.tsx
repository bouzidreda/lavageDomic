import { useState } from "react";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { useI18n } from "../../i18n";

export function ReviewForm({ onSubmit, busy }: { onSubmit: (v: { rating: number; comment?: string }) => void; busy?: boolean }) {
  const { t } = useI18n();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <div className="grid gap-2">
      <div className="text-sm font-semibold">{t("review.form.rating")}</div>
      <Select value={String(rating)} onChange={(e) => setRating(Number(e.target.value))}>
        <option value="5">5</option>
        <option value="4">4</option>
        <option value="3">3</option>
        <option value="2">2</option>
        <option value="1">1</option>
      </Select>
      <div className="text-sm font-semibold mt-2">{t("review.form.comment")}</div>
      <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder={t("booking.form.optional")} />
      <Button disabled={busy} onClick={() => onSubmit({ rating, comment: comment.trim() ? comment : undefined })}>
        {busy ? t("review.form.sending") : t("review.form.submit")}
      </Button>
    </div>
  );
}
