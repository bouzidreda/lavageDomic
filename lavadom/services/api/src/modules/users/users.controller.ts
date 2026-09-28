import type { Response } from "express";
import type { AuthedReq } from "../../middleware/auth";
import {
  deleteMyAddress,
  deleteMyVehicle,
  getMe,
  listMyAddresses,
  listMyVehicles,
  patchMe,
  upsertMyAddress,
  upsertMyVehicle
} from "./users.service";

export async function me(req: AuthedReq, res: Response) {
  const user = await getMe(req.user!.id);
  res.json({ user });
}

export async function updateMe(req: AuthedReq, res: Response) {
  const user = await patchMe(req.user!.id, req.body);
  res.json({ user });
}

export async function listAddresses(req: AuthedReq, res: Response) {
  const items = await listMyAddresses(req.user!.id);
  res.json({ items });
}

export async function createOrUpdateAddress(req: AuthedReq, res: Response) {
  const item = await upsertMyAddress(req.user!.id, req.body);
  res.json({ item });
}

export async function deleteAddress(req: AuthedReq, res: Response) {
  await deleteMyAddress(req.user!.id, req.params.id);
  res.json({ ok: true });
}

export async function listVehicles(req: AuthedReq, res: Response) {
  const items = await listMyVehicles(req.user!.id);
  res.json({ items });
}

export async function createOrUpdateVehicle(req: AuthedReq, res: Response) {
  const item = await upsertMyVehicle(req.user!.id, req.body);
  res.json({ item });
}

export async function deleteVehicle(req: AuthedReq, res: Response) {
  await deleteMyVehicle(req.user!.id, req.params.id);
  res.json({ ok: true });
}