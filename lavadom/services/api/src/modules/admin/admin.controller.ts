import type { Request, Response } from "express";
import type { AuthedReq } from "../../middleware/auth";
import {
  getAdminDashboard,
  getCommissionReport,
  getPlatformUserDetails,
  getProviderKycDocuments,
  listPlatformBookings,
  listCmsPages,
  listPlatformUsers,
  reviewKycDocument,
  setProviderVerification,
  setUserStatus,
  upsertCmsPage
} from "./admin.service";

export async function dashboard(_req: Request, res: Response) {
  res.json(await getAdminDashboard());
}

export async function listUsers(_req: Request, res: Response) {
  res.json(await listPlatformUsers());
}

export async function userDetails(req: Request, res: Response) {
  res.json(await getPlatformUserDetails(req.params.id));
}

export async function updateUserStatus(req: Request, res: Response) {
  const authedReq = req as AuthedReq;
  res.json(await setUserStatus(authedReq.user!.id, req.params.id, req.body.status, req.body.reason));
}

export async function listProviderDocuments(req: Request, res: Response) {
  res.json(await getProviderKycDocuments(req.params.id));
}

export async function reviewProviderDocument(req: AuthedReq, res: Response) {
  res.json(
    await reviewKycDocument(req.user!.id, req.params.providerId, req.params.documentId, req.body.status, req.body.reason)
  );
}

export async function updateProviderVerification(req: Request, res: Response) {
  res.json(await setProviderVerification(req.params.id, req.body.status, req.body.notes));
}

export async function reportCommissions(_req: Request, res: Response) {
  res.json(await getCommissionReport());
}

export async function listBookings(_req: Request, res: Response) {
  res.json(await listPlatformBookings());
}

export async function listCms(_req: Request, res: Response) {
  res.json(await listCmsPages());
}

export async function upsertCms(req: Request, res: Response) {
  res.json(await upsertCmsPage(req.body));
}
