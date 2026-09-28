import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  adminBookings,
  adminCms,
  adminCommissionReport,
  adminDashboard,
  adminProviderDocuments,
  adminReviewProviderDocument,
  adminSetProviderVerification,
  adminSetUserStatus,
  adminUserDetails,
  adminUpsertCms,
  adminUsers
} from "../../api/admin";
import { updateBookingStatus } from "../../api/bookings";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { useI18n } from "../../i18n";
import { parseJwt } from "../../lib/validators";
import { authStore } from "../../store/auth";

export default function AdminDashboardPage() {
  const { t } = useI18n();
  const currentAdminId = parseJwt(authStore.getAccessToken() ?? "")?.sub as string | undefined;
  const qStats = useQuery({ queryKey: ["adminDashboard"], queryFn: adminDashboard });
  const qUsers = useQuery({ queryKey: ["adminUsers"], queryFn: adminUsers });
  const qCommissions = useQuery({ queryKey: ["adminCommissions"], queryFn: adminCommissionReport });
  const qCms = useQuery({ queryKey: ["adminCms"], queryFn: adminCms });
  const qBookings = useQuery({ queryKey: ["adminBookings"], queryFn: adminBookings });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const qUserDetails = useQuery({
    queryKey: ["adminUserDetails", selectedUserId],
    queryFn: () => adminUserDetails(selectedUserId!),
    enabled: !!selectedUserId
  });

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const qProviderDocs = useQuery({
    queryKey: ["adminProviderDocs", selectedProviderId],
    queryFn: () => adminProviderDocuments(selectedProviderId!),
    enabled: !!selectedProviderId
  });

  const mStatus = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION"; reason?: string }) =>
      adminSetUserStatus(id, status, reason),
    onSuccess: () => qUsers.refetch()
  });
  const mVerify = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "VERIFIED" | "REJECTED" }) => adminSetProviderVerification(id, status),
    onSuccess: () => {
      qUsers.refetch();
      qStats.refetch();
      qProviderDocs.refetch();
    }
  });
  const mReviewDoc = useMutation({
    mutationFn: (args: { providerId: string; documentId: string; status: "APPROVED" | "REJECTED"; reason?: string }) =>
      adminReviewProviderDocument(args.providerId, args.documentId, args.status, args.reason),
    onSuccess: () => {
      qProviderDocs.refetch();
      qUsers.refetch();
      qStats.refetch();
    }
  });
  const mBookingState = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: "REQUESTED" | "ACCEPTED" | "DECLINED" | "ON_THE_WAY" | "ARRIVED" | "IN_PROGRESS" | "DONE" | "CANCELLED" }) =>
      updateBookingStatus({ bookingId, status }),
    onSuccess: () => qBookings.refetch()
  });

  const [slug, setSlug] = useState("faq");
  const [title, setTitle] = useState("FAQ");
  const [content, setContent] = useState("Questions frequentes");
  const [suspendTarget, setSuspendTarget] = useState<{ id: string; name: string } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendReasonError, setSuspendReasonError] = useState<string | null>(null);
  const mCms = useMutation({ mutationFn: () => adminUpsertCms({ slug, title, content }), onSuccess: () => qCms.refetch() });

  const conflictBookings = useMemo(
    () => (qBookings.data?.items ?? []).filter((b) => b.status === "DECLINED" || b.status === "CANCELLED" || b.paymentStatus === "FAILED"),
    [qBookings.data?.items]
  );

  function openSuspendModal(userId: string, userName: string) {
    setSuspendTarget({ id: userId, name: userName });
    setSuspendReason("");
    setSuspendReasonError(null);
  }

  function closeUserDetailsModal() {
    setSelectedUserId(null);
  }

  function closeSuspendModal() {
    if (mStatus.isPending) return;
    setSuspendTarget(null);
    setSuspendReason("");
    setSuspendReasonError(null);
  }

  function confirmSuspend() {
    if (!suspendTarget) return;
    const reason = suspendReason.trim();
    if (!reason) {
      setSuspendReasonError(t("admin.suspend.reasonRequired"));
      return;
    }
    mStatus.mutate(
      { id: suspendTarget.id, status: "SUSPENDED", reason },
      {
        onSuccess: () => closeSuspendModal()
      }
    );
  }

  return (
    <div className="grid gap-4">
      {selectedUserId ? (
        <div className="fixed inset-0 z-[130] grid place-items-center bg-black/60 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-2xl border border-[#d9c8be] bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#5f2c15]">{t("admin.users")} - Details</h2>
              <Button className="ml-auto" variant="ghost" onClick={closeUserDetailsModal}>{t("topbar.close")}</Button>
            </div>

            {qUserDetails.isLoading ? <div className="mt-4 text-sm">{t("common.loading")}</div> : null}
            {!qUserDetails.isLoading && !qUserDetails.data ? <div className="mt-4 text-sm">{t("common.notFound")}</div> : null}

            {qUserDetails.data ? (
              <div className="mt-4 grid gap-4">
                <Card className="border-[#e8d6cc]">
                  <div className="text-base font-extrabold text-[#5f2c15]">{qUserDetails.data.user.name} ({qUserDetails.data.user.role})</div>
                  <div className="mt-2 grid gap-1 text-sm text-neutral-700">
                    <div>ID: {qUserDetails.data.user.id}</div>
                    <div>Email: {qUserDetails.data.user.email}</div>
                    <div>Phone: {qUserDetails.data.user.phone}</div>
                    <div>{t("profile.status")}: {qUserDetails.data.user.accountStatus}</div>
                    {qUserDetails.data.user.suspensionReason ? <div>{t("admin.reason")}: {qUserDetails.data.user.suspensionReason}</div> : null}
                    <div>Email verified: {qUserDetails.data.user.emailVerified ? "Yes" : "No"}</div>
                    <div>Created: {new Date(qUserDetails.data.user.createdAt).toLocaleString()}</div>
                    <div>Updated: {new Date(qUserDetails.data.user.updatedAt).toLocaleString()}</div>
                  </div>
                </Card>

                <section className="grid gap-3 md:grid-cols-2">
                  <Card className="border-[#e8d6cc]">
                    <div className="text-sm font-extrabold text-[#5f2c15]">Addresses</div>
                    <div className="mt-2 grid gap-2 text-sm">
                      {qUserDetails.data.addresses.length === 0 ? <div className="text-neutral-600">No addresses</div> : null}
                      {qUserDetails.data.addresses.map((a) => (
                        <div key={a.id} className="rounded-lg border border-[#f2d8cb] p-2">
                          <div className="font-semibold">{a.label}{a.isDefault ? " (default)" : ""}</div>
                          <div>{a.addressLine}</div>
                          <div className="text-neutral-600">{a.city ?? "-"}</div>
                          <div className="text-neutral-600">Lat/Lng: {a.lat ?? "-"} / {a.lng ?? "-"}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="border-[#e8d6cc]">
                    <div className="text-sm font-extrabold text-[#5f2c15]">Vehicles</div>
                    <div className="mt-2 grid gap-2 text-sm">
                      {qUserDetails.data.vehicles.length === 0 ? <div className="text-neutral-600">No vehicles</div> : null}
                      {qUserDetails.data.vehicles.map((v) => (
                        <div key={v.id} className="rounded-lg border border-[#f2d8cb] p-2">
                          <div className="font-semibold">{v.label}</div>
                          <div>{v.brand ?? "-"} {v.model ?? ""}</div>
                          <div className="text-neutral-600">Plate: {v.plateNumber ?? "-"}</div>
                          <div className="text-neutral-600">Color: {v.color ?? "-"}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>

                <Card className="border-[#e8d6cc]">
                  <div className="text-sm font-extrabold text-[#5f2c15]">Client bookings</div>
                  <div className="mt-2 grid gap-2 text-sm">
                    {qUserDetails.data.bookingsAsClient.length === 0 ? <div className="text-neutral-600">No bookings</div> : null}
                    {qUserDetails.data.bookingsAsClient.slice(0, 20).map((b) => (
                      <div key={b.id} className="rounded-lg border border-[#f2d8cb] p-2">
                        <div className="font-semibold">{b.status} | {b.paymentStatus}</div>
                        <div>{new Date(b.scheduledAt).toLocaleString()}</div>
                        <div>{b.address}</div>
                        <div className="text-neutral-600">{b.totalPrice} MAD</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {qUserDetails.data.provider ? (
                  <section className="grid gap-3">
                    <Card className="border-[#e8d6cc]">
                      <div className="text-sm font-extrabold text-[#5f2c15]">Provider profile</div>
                      <div className="mt-2 grid gap-1 text-sm text-neutral-700">
                        <div>Provider ID: {qUserDetails.data.provider.id}</div>
                        <div>Verification: {qUserDetails.data.provider.verificationStatus}</div>
                        <div>{t("profile.city")}: {qUserDetails.data.provider.city ?? "-"}</div>
                        <div>{t("provider.dashboard.radius")}: {qUserDetails.data.provider.radiusKm} km</div>
                        <div>{t("provider.dashboard.priceFrom")}: {qUserDetails.data.provider.priceFrom} MAD</div>
                        <div>Rating: {qUserDetails.data.provider.ratingAvg} ({qUserDetails.data.provider.ratingCount})</div>
                        <div>Bio: {qUserDetails.data.provider.bio ?? "-"}</div>
                      </div>
                    </Card>

                    <section className="grid gap-3 md:grid-cols-2">
                      <Card className="border-[#e8d6cc]">
                        <div className="text-sm font-extrabold text-[#5f2c15]">Provider services</div>
                        <div className="mt-2 grid gap-2 text-sm">
                          {qUserDetails.data.provider.services.length === 0 ? <div className="text-neutral-600">No services</div> : null}
                          {qUserDetails.data.provider.services.map((s) => (
                            <div key={s.id} className="rounded-lg border border-[#f2d8cb] p-2">
                              <div className="font-semibold">{s.name}</div>
                              <div>{s.price} MAD</div>
                              <div className="text-neutral-600">Active: {s.active ? "Yes" : "No"}</div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="border-[#e8d6cc]">
                        <div className="text-sm font-extrabold text-[#5f2c15]">Provider documents</div>
                        <div className="mt-2 grid gap-2 text-sm">
                          {qUserDetails.data.provider.documents.length === 0 ? <div className="text-neutral-600">No documents</div> : null}
                          {qUserDetails.data.provider.documents.map((d) => (
                            <div key={d.id} className="rounded-lg border border-[#f2d8cb] p-2">
                              <div className="font-semibold">{d.type} - {d.status}</div>
                              <div>{d.label ?? "-"}</div>
                              {d.rejectionReason ? <div className="text-[#8a2f2f]">{d.rejectionReason}</div> : null}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </section>

                    <Card className="border-[#e8d6cc]">
                      <div className="text-sm font-extrabold text-[#5f2c15]">Provider bookings</div>
                      <div className="mt-2 grid gap-2 text-sm">
                        {qUserDetails.data.provider.bookings.length === 0 ? <div className="text-neutral-600">No bookings</div> : null}
                        {qUserDetails.data.provider.bookings.slice(0, 20).map((b) => (
                          <div key={b.id} className="rounded-lg border border-[#f2d8cb] p-2">
                            <div className="font-semibold">{b.status} | {b.paymentStatus}</div>
                            <div>{new Date(b.scheduledAt).toLocaleString()}</div>
                            <div>{b.address}</div>
                            <div className="text-neutral-600">{b.totalPrice} MAD</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </section>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {suspendTarget ? (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#f2d0c1] bg-white p-5 shadow-2xl">
            <h2 className="text-xl font-extrabold text-[#5f2c15]">{t("admin.suspend.modalTitle")}</h2>
            <p className="mt-2 text-sm text-[#7d4a35]">
              {t("admin.suspend.modalHint")} <span className="font-bold">{suspendTarget.name}</span>.
            </p>
            <div className="mt-3">
              <Textarea
                value={suspendReason}
                onChange={(e) => {
                  setSuspendReason(e.target.value);
                  if (suspendReasonError) setSuspendReasonError(null);
                }}
                rows={4}
                placeholder={t("admin.suspend.reasonPlaceholder")}
              />
              {suspendReasonError ? <div className="mt-1 text-sm text-[#a03838]">{suspendReasonError}</div> : null}
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={closeSuspendModal} disabled={mStatus.isPending}>{t("admin.suspend.cancel")}</Button>
              <Button onClick={confirmSuspend} disabled={mStatus.isPending}>{mStatus.isPending ? "..." : t("admin.suspend.confirm")}</Button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-[24px] border border-[#f3d4c5] bg-[linear-gradient(145deg,#fff2ec_0%,#ffe6da_60%,#ffeede_100%)] p-5 md:p-7">
        <div className="kicker text-[#924f30]">{t("admin.dashboard.kicker")}</div>
        <h1 className="mt-2 text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.04] text-[#5f2c15]">{t("admin.title")}</h1>
        <p className="mt-2 text-sm text-[#8b4b2f]">{t("admin.dashboard.owner")}</p>
      </section>

      <section className="grid gap-3 text-sm md:grid-cols-5">
        <Card className="border-[#f0cab6] bg-white"><b>{t("admin.users")}:</b> {qStats.data?.stats.users ?? "-"}</Card>
        <Card className="border-[#f0cab6] bg-white"><b>{t("admin.providers")}:</b> {qStats.data?.stats.providers ?? "-"}</Card>
        <Card className="border-[#f0cab6] bg-white"><b>{t("admin.pendingProviders")}:</b> {qStats.data?.stats.pendingProviders ?? "-"}</Card>
        <Card className="border-[#f0cab6] bg-white"><b>{t("admin.bookings")}:</b> {qStats.data?.stats.bookings ?? "-"}</Card>
        <Card className="border-[#f0cab6] bg-white"><b>{t("admin.commissions")}:</b> {qStats.data?.stats.commissionRevenueMad ?? "-"} MAD</Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Card className="border-[#f0cab6]">
          <div className="text-lg font-extrabold text-[#5f2c15]">{t("admin.usersVerification")}</div>
          <div className="mt-2 grid gap-2 text-sm">
            {(qUsers.data?.items ?? []).slice(0, 20).map((u) => {
              const isSelf = u.id === currentAdminId;
              return (
              <div key={u.id} className="grid items-start gap-2 rounded-lg border border-[#f2d8cb] bg-white p-2 xl:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                <div
                  className="min-w-0 cursor-pointer rounded-lg border border-transparent p-1 transition hover:border-[#f0cab6] hover:bg-[#fffaf7]"
                  onClick={() => setSelectedUserId(u.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedUserId(u.id);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="font-semibold">{u.name} ({u.role})</div>
                  <div className="break-all text-neutral-600">{u.email}</div>
                  <div className="text-neutral-600">{t("profile.status")}: {u.accountStatus}</div>
                  {u.accountStatus === "SUSPENDED" && u.suspensionReason ? (
                    <div className="text-neutral-600">{t("admin.reason")}: {u.suspensionReason}</div>
                  ) : null}
                  <div className="mt-1 text-xs font-bold text-[#924f30]">Click to view full details</div>
                </div>
                <Button className="w-fit" variant="ghost" disabled={mStatus.isPending} onClick={() => mStatus.mutate({ id: u.id, status: "ACTIVE" })}>{t("admin.activate")}</Button>
                <Button className="w-fit" variant="ghost" disabled={mStatus.isPending || isSelf} onClick={() => openSuspendModal(u.id, u.name)}>{t("admin.suspend")}</Button>
                {u.role === "PROVIDER" ? (
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <Button className="w-fit" variant="ghost" disabled={mVerify.isPending || !u.providerId} onClick={() => u.providerId && mVerify.mutate({ id: u.providerId, status: "VERIFIED" })}>{t("admin.verify")}</Button>
                    <Button className="w-fit" variant="ghost" disabled={mVerify.isPending || !u.providerId} onClick={() => u.providerId && mVerify.mutate({ id: u.providerId, status: "REJECTED" })}>{t("admin.reject")}</Button>
                    <Button className="w-fit" variant="ghost" disabled={!u.providerId} onClick={() => setSelectedProviderId((prev) => (prev === u.providerId ? null : u.providerId))}>
                      {selectedProviderId === u.providerId ? t("admin.hideDocs") : t("admin.reviewDocs")}
                    </Button>
                  </div>
                ) : <div />}
              </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-[#f0cab6]">
          <div className="text-lg font-extrabold text-[#5f2c15]">{t("admin.dashboard.conflicts")}</div>
          <div className="mt-2 grid gap-2 text-sm">
            {conflictBookings.length === 0 ? <div>{t("admin.dashboard.noConflicts")}</div> : null}
            {conflictBookings.slice(0, 15).map((b) => (
              <div key={b.id} className="rounded-lg border border-[#f2d8cb] bg-white p-2">
                <div className="font-semibold">{b.clientName} {"->"} {b.providerName}</div>
                <div className="text-neutral-600">{b.status} | {b.paymentStatus} | {b.totalPrice} MAD</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button variant="ghost" disabled={mBookingState.isPending} onClick={() => mBookingState.mutate({ bookingId: b.id, status: "ACCEPTED" })}>ACCEPTED</Button>
                  <Button variant="ghost" disabled={mBookingState.isPending} onClick={() => mBookingState.mutate({ bookingId: b.id, status: "CANCELLED" })}>CANCELLED</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {selectedProviderId ? (
        <Card className="border-[#f0cab6]">
          <div className="text-lg font-extrabold text-[#5f2c15]">{t("admin.kycReview")}</div>
          <div className="mt-2 grid gap-2 text-sm">
            {(qProviderDocs.data?.items ?? []).map((d) => (
              <div key={d.id} className="rounded-lg border border-[#f2d8cb] bg-white p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold">{d.type}</div>
                  <div className="text-neutral-600">{d.label ?? "-"}</div>
                  <div className="ml-auto text-xs">{d.status}</div>
                </div>
                <div className="mt-2 max-h-28 overflow-auto rounded bg-[#fff7f3] p-2 text-xs whitespace-pre-wrap">{d.payloadPreview}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button variant="ghost" disabled={mReviewDoc.isPending} onClick={() => mReviewDoc.mutate({ providerId: selectedProviderId, documentId: d.id, status: "APPROVED" })}>{t("admin.approveDoc")}</Button>
                  <Button variant="ghost" disabled={mReviewDoc.isPending} onClick={() => mReviewDoc.mutate({ providerId: selectedProviderId, documentId: d.id, status: "REJECTED", reason: "Invalid or unreadable document" })}>{t("admin.rejectDoc")}</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="border-[#f0cab6]">
        <div className="text-lg font-extrabold text-[#5f2c15]">{t("admin.commissionsReport")}</div>
        <div className="mt-2 grid gap-2 text-sm">
          {(qCommissions.data?.items ?? []).map((r) => (
            <div key={r.providerId} className="flex gap-2 rounded-lg border border-[#f2d8cb] bg-white p-2">
              <div>{r.providerName}</div>
              <div className="ml-auto">{t("admin.gross")} {r.grossMad} MAD</div>
              <div>{t("admin.commission")} {r.commissionMad} MAD</div>
              <div>{t("admin.providerNet")} {r.providerNetMad} MAD</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-[#f0cab6]">
        <div className="text-lg font-extrabold text-[#5f2c15]">{t("admin.cms")}</div>
        <div className="mt-2 grid gap-2">
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={t("admin.slug")} />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("admin.cmsTitle")} />
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder={t("admin.cmsContent")} />
          <Button disabled={mCms.isPending} onClick={() => mCms.mutate()}>{mCms.isPending ? "..." : t("admin.savePage")}</Button>
          <div className="grid gap-2 text-sm">
            {(qCms.data?.items ?? []).map((p) => (
              <div key={p.id} className="rounded-lg border border-[#f2d8cb] bg-white p-2">
                <div className="font-semibold">{p.title} ({p.slug})</div>
                <div className="line-clamp-2 text-neutral-600">{p.content}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
