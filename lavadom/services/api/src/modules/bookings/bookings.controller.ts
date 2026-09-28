import type { Response } from "express";
import type { AuthedReq } from "../../middleware/auth";
import {
  captureBookingPayment,
  createBooking,
  createBookingPaymentIntent,
  myBookings,
  providerBookings,
  updateStatus
} from "./bookings.service";

export async function create(req: AuthedReq, res: Response) {
  const out = await createBooking({ ...req.body, clientId: req.user!.id });
  res.json(out);
}

export async function mine(req: AuthedReq, res: Response) {
  const out = await myBookings(req.user!.id);
  res.json(out);
}

export async function provider(req: AuthedReq, res: Response) {
  const out = await providerBookings(req.user!.id);
  res.json(out);
}

export async function status(req: AuthedReq, res: Response) {
  const out = await updateStatus(req.user!.id, req.user!.role, req.body);
  res.json(out);
}

export async function createPaymentIntent(req: AuthedReq, res: Response) {
  const out = await createBookingPaymentIntent(req.user!.id, req.body);
  res.json(out);
}

export async function capturePayment(req: AuthedReq, res: Response) {
  const out = await captureBookingPayment(req.user!.id, req.body.bookingId);
  res.json(out);
}