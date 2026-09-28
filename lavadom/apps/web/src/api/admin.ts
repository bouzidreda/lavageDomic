import { api } from "./client";

export function adminDashboard() {
  return api<{ stats: { users: number; providers: number; pendingProviders: number; bookings: number; commissionRevenueMad: number } }>(
    "/v1/admin/dashboard",
    "GET"
  );
}

export function adminUsers() {
  return api<{
    items: Array<{
      id: string;
      providerId: string | null;
      role: "CLIENT" | "PROVIDER" | "ADMIN";
      name: string;
      email: string;
      phone: string;
      accountStatus: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
      suspensionReason: string | null;
      emailVerified: boolean;
      createdAt: string;
    }>;
  }>("/v1/admin/users", "GET");
}

type AdminBookingSummary = {
  id: string;
  status: "REQUESTED" | "ACCEPTED" | "DECLINED" | "ON_THE_WAY" | "ARRIVED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  scheduledAt: string;
  address: string;
  totalPrice: number;
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "REFUNDED" | "FAILED";
  createdAt: string;
};

export function adminUserDetails(id: string) {
  return api<{
    user: {
      id: string;
      role: "CLIENT" | "PROVIDER" | "ADMIN";
      name: string;
      email: string;
      phone: string;
      accountStatus: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
      suspensionReason: string | null;
      emailVerified: boolean;
      createdAt: string;
      updatedAt: string;
    };
    addresses: Array<{
      id: string;
      label: string;
      addressLine: string;
      city: string | null;
      lat: number | null;
      lng: number | null;
      isDefault: boolean;
      createdAt: string;
    }>;
    vehicles: Array<{
      id: string;
      label: string;
      brand: string | null;
      model: string | null;
      plateNumber: string | null;
      color: string | null;
      createdAt: string;
    }>;
    bookingsAsClient: AdminBookingSummary[];
    provider: null | {
      id: string;
      bio: string | null;
      city: string | null;
      lat: number;
      lng: number;
      radiusKm: number;
      priceFrom: number;
      ratingAvg: number;
      ratingCount: number;
      verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
      verificationNotes: string | null;
      identityDocUrl: string | null;
      availabilityJson: string | null;
      createdAt: string;
      services: Array<{
        id: string;
        name: string;
        price: number;
        active: boolean;
        createdAt: string;
      }>;
      documents: Array<{
        id: string;
        type: "NATIONAL_ID" | "DRIVING_LICENSE" | "PASSPORT" | "OWNERSHIP_PAPER";
        label: string | null;
        status: "PENDING" | "APPROVED" | "REJECTED";
        rejectionReason: string | null;
        reviewedAt: string | null;
        createdAt: string;
      }>;
      bookings: AdminBookingSummary[];
    };
  }>(`/v1/admin/users/${id}`, "GET");
}

export function adminSetUserStatus(id: string, status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION", reason?: string) {
  return api<{ user: { id: string; accountStatus: string; suspensionReason: string | null } }>(`/v1/admin/users/${id}/status`, "PATCH", {
    status,
    reason
  });
}

export function adminSetProviderVerification(id: string, status: "PENDING" | "VERIFIED" | "REJECTED", notes?: string) {
  return api<{ provider: { id: string; verificationStatus: string; verificationNotes: string | null } }>(
    `/v1/admin/providers/${id}/verification`,
    "PATCH",
    { status, notes }
  );
}

export function adminProviderDocuments(providerId: string) {
  return api<{
    items: Array<{
      id: string;
      type: "NATIONAL_ID" | "DRIVING_LICENSE" | "PASSPORT" | "OWNERSHIP_PAPER";
      label: string | null;
      status: "PENDING" | "APPROVED" | "REJECTED";
      rejectionReason: string | null;
      payloadPreview: string;
      reviewedAt: string | null;
      createdAt: string;
    }>;
  }>(`/v1/admin/providers/${providerId}/documents`, "GET");
}

export function adminReviewProviderDocument(
  providerId: string,
  documentId: string,
  status: "APPROVED" | "REJECTED",
  reason?: string
) {
  return api<{ documents: Array<{ id: string; status: string }> }>(
    `/v1/admin/providers/${providerId}/documents/${documentId}/review`,
    "PATCH",
    { status, reason }
  );
}

export function adminCommissionReport() {
  return api<{
    items: Array<{ providerId: string; providerName: string; grossMad: number; commissionMad: number; providerNetMad: number }>;
  }>("/v1/admin/reports/commissions", "GET");
}

export function adminBookings() {
  return api<{
    items: Array<{
      id: string;
      status: "REQUESTED" | "ACCEPTED" | "DECLINED" | "ON_THE_WAY" | "ARRIVED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
      scheduledAt: string;
      address: string;
      totalPrice: number;
      paymentStatus: "UNPAID" | "PENDING" | "PAID" | "REFUNDED" | "FAILED";
      clientName: string;
      providerName: string;
      createdAt: string;
    }>;
  }>("/v1/admin/bookings", "GET");
}

export function adminCms() {
  return api<{ items: Array<{ id: string; slug: string; title: string; content: string; updatedAt: string }> }>("/v1/admin/cms", "GET");
}

export function adminUpsertCms(input: { id?: string; slug: string; title: string; content: string }) {
  return api<{ page: { id: string; slug: string; title: string; content: string } }>("/v1/admin/cms", "POST", input);
}
