export function bbox(lat: number, lng: number, km: number) {
  const dLat = km / 110.574;
  const dLng = km / (111.320 * Math.cos((lat * Math.PI) / 180));
  return { minLat: lat - dLat, maxLat: lat + dLat, minLng: lng - dLng, maxLng: lng + dLng };
}

export function haversineSql() {
  return `
  (6371 * 2 * ASIN(
    SQRT(
      POWER(SIN(((:lat - p.lat) * ACOS(-1) / 180) / 2), 2) +
      COS(:lat * ACOS(-1) / 180) * COS(p.lat * ACOS(-1) / 180) *
      POWER(SIN(((:lng - p.lng) * ACOS(-1) / 180) / 2), 2)
    )
  ))
  `;
}
