import { q } from "../../db/oracle";
import { uuid } from "../../utils/crypto";

function mapUser(u: any) {
  return {
    id: u.ID,
    role: u.ROLE,
    name: u.NAME,
    email: u.EMAIL,
    phone: u.PHONE,
    accountStatus: u.ACCOUNT_STATUS,
    emailVerified: Boolean(u.EMAIL_VERIFIED)
  };
}

export async function getMe(userId: string) {
  const rows = await q<any>(
    `SELECT id, role, name, email, phone, account_status, email_verified FROM users WHERE id = :id`,
    { id: userId }
  );
  const u = rows[0];
  if (!u) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });
  return mapUser(u);
}

export async function patchMe(userId: string, input: { name?: string; email?: string; phone?: string }) {
  const sets: string[] = [];
  const binds: any = { id: userId };

  if (input.name) {
    sets.push("name = :name");
    binds.name = input.name;
  }
  if (input.email) {
    sets.push("email = :email");
    binds.email = input.email.toLowerCase();
  }
  if (input.phone) {
    sets.push("phone = :phone");
    binds.phone = input.phone;
  }

  if (sets.length) {
    sets.push("updated_at = SYSTIMESTAMP");
    await q(`UPDATE users SET ${sets.join(", ")} WHERE id = :id`, binds);
  }

  return getMe(userId);
}

function mapAddress(r: any) {
  return {
    id: r.ID,
    label: r.LABEL,
    addressLine: r.ADDRESS_LINE,
    city: r.CITY ?? null,
    lat: r.LAT === null ? null : Number(r.LAT),
    lng: r.LNG === null ? null : Number(r.LNG),
    isDefault: Number(r.IS_DEFAULT) === 1
  };
}

export async function listMyAddresses(userId: string) {
  const rows = await q<any>(
    `SELECT id, label, address_line, city, lat, lng, is_default
     FROM user_addresses
     WHERE user_id = :userId
     ORDER BY is_default DESC, created_at DESC`,
    { userId: userId }
  );
  return rows.map(mapAddress);
}

export async function upsertMyAddress(
  userId: string,
  input: { id?: string; label: string; addressLine: string; city?: string; lat?: number; lng?: number; isDefault?: boolean }
) {
  if (input.isDefault) {
    await q(`UPDATE user_addresses SET is_default = 0 WHERE user_id = :userId`, { userId: userId });
  }

  if (input.id) {
    await q(
      `UPDATE user_addresses
       SET label = :label, address_line = :addressLine, city = :city, lat = :lat, lng = :lng, is_default = :isDefault
       WHERE id = :id AND user_id = :userId`,
      {
        id: input.id,
        userId: userId,
        label: input.label,
        addressLine: input.addressLine,
        city: input.city ?? null,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        isDefault: input.isDefault ? 1 : 0
      }
    );
  } else {
    await q(
      `INSERT INTO user_addresses (id, user_id, label, address_line, city, lat, lng, is_default)
       VALUES (:id, :userId, :label, :addressLine, :city, :lat, :lng, :isDefault)`,
      {
        id: uuid(),
        userId: userId,
        label: input.label,
        addressLine: input.addressLine,
        city: input.city ?? null,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        isDefault: input.isDefault ? 1 : 0
      }
    );
  }

  const rows = await listMyAddresses(userId);
  return rows[0];
}

export async function deleteMyAddress(userId: string, addressId: string) {
  await q(`DELETE FROM user_addresses WHERE id = :id AND user_id = :userId`, { id: addressId, userId: userId });
}

function mapVehicle(r: any) {
  return {
    id: r.ID,
    label: r.LABEL,
    brand: r.BRAND ?? null,
    model: r.MODEL ?? null,
    plateNumber: r.PLATE_NUMBER ?? null,
    color: r.COLOR ?? null
  };
}

export async function listMyVehicles(userId: string) {
  const rows = await q<any>(
    `SELECT id, label, brand, model, plate_number, color
     FROM user_vehicles
     WHERE user_id = :userId
     ORDER BY created_at DESC`,
    { userId: userId }
  );
  return rows.map(mapVehicle);
}

export async function upsertMyVehicle(
  userId: string,
  input: { id?: string; label: string; brand?: string; model?: string; plateNumber?: string; color?: string }
) {
  if (input.id) {
    await q(
      `UPDATE user_vehicles
       SET label = :label, brand = :brand, model = :model, plate_number = :plateNumber, color = :color
       WHERE id = :id AND user_id = :userId`,
      {
        id: input.id,
        userId: userId,
        label: input.label,
        brand: input.brand ?? null,
        model: input.model ?? null,
        plateNumber: input.plateNumber ?? null,
        color: input.color ?? null
      }
    );
  } else {
    await q(
      `INSERT INTO user_vehicles (id, user_id, label, brand, model, plate_number, color)
       VALUES (:id, :userId, :label, :brand, :model, :plateNumber, :color)`,
      {
        id: uuid(),
        userId: userId,
        label: input.label,
        brand: input.brand ?? null,
        model: input.model ?? null,
        plateNumber: input.plateNumber ?? null,
        color: input.color ?? null
      }
    );
  }

  const rows = await listMyVehicles(userId);
  return rows[0];
}

export async function deleteMyVehicle(userId: string, vehicleId: string) {
  await q(`DELETE FROM user_vehicles WHERE id = :id AND user_id = :userId`, { id: vehicleId, userId: userId });
}
