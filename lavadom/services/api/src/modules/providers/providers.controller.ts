import type { Request, Response } from "express";
import type { AuthedReq } from "../../middleware/auth";
import { getMyProvider, getProvider, listMyProviderDocuments, searchProviders, submitProviderDocuments, updateMyProvider } from "./providers.service";

export async function search(req: Request, res: Response) {
  const out = await searchProviders(req.body);
  res.json(out);
}

export async function byId(req: Request, res: Response) {
  const out = await getProvider(req.params.id);
  res.json(out);
}

export async function me(req: AuthedReq, res: Response) {
  const out = await getMyProvider(req.user!.id);
  res.json(out);
}

export async function patchMe(req: AuthedReq, res: Response) {
  const out = await updateMyProvider(req.user!.id, req.body);
  res.json(out);
}

export async function myDocuments(req: AuthedReq, res: Response) {
  const out = await listMyProviderDocuments(req.user!.id);
  res.json(out);
}

export async function submitDocuments(req: AuthedReq, res: Response) {
  const out = await submitProviderDocuments(req.user!.id, req.body.items);
  res.json(out);
}
