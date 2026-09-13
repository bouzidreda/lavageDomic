import type { Request, Response } from "express";
import { getCmsBySlug } from "./cms.service";

export async function getCms(req: Request, res: Response) {
  res.json(await getCmsBySlug(req.params.slug));
}
