import type { Response } from "express";
import type { AuthedReq } from "../../middleware/auth";
import { getMe, patchMe } from "./users.service";

export async function me(req: AuthedReq, res: Response) {
  const user = await getMe(req.user!.id);
  res.json({ user });
}

export async function updateMe(req: AuthedReq, res: Response) {
  const user = await patchMe(req.user!.id, req.body);
  res.json({ user });
}
