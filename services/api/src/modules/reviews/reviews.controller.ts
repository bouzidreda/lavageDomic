import type { Request, Response } from "express";
import type { AuthedReq } from "../../middleware/auth";
import { createReview, listProviderReviews } from "./reviews.service";

export async function listByProvider(req: Request, res: Response) {
  const out = await listProviderReviews(req.params.providerId);
  res.json(out);
}

export async function create(req: AuthedReq, res: Response) {
  const out = await createReview({ ...req.body, clientId: req.user!.id });
  res.json(out);
}
