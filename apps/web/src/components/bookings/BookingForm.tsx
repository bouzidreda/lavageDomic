import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

export function BookingForm(props: {
  onSubmit: (v: { scheduledAt: string; address: string; notes?: string }) => void;
  busy?: boolean;
}) {
  const [scheduledAt, setScheduledAt] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="grid gap-2">
      <div className="text-sm font-semibold">Schedule</div>
      <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
      <div className="text-sm font-semibold mt-2">Address</div>
      <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city" />
      <div className="text-sm font-semibold mt-2">Notes</div>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" rows={3} />
      <Button
        disabled={props.busy || !scheduledAt || !address}
        onClick={() => props.onSubmit({ scheduledAt, address, notes: notes.trim() ? notes : undefined })}
      >
        {props.busy ? "Creating..." : "Confirm booking"}
      </Button>
    </div>
  );
}
