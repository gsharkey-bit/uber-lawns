// Geometry helpers.
// Computes the area in square meters of a polygon given as
// an ordered array of { latitude, longitude } points using the
// spherical excess formula (good enough for residential lawns).

const EARTH_RADIUS_M = 6378137;
const SQM_TO_SQFT = 10.7639;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

export function polygonAreaSquareMeters(coords) {
  if (!Array.isArray(coords) || coords.length < 3) return 0;

  let total = 0;
  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    total +=
      (toRadians(p2.longitude) - toRadians(p1.longitude)) *
      (2 + Math.sin(toRadians(p1.latitude)) + Math.sin(toRadians(p2.latitude)));
  }
  total = (total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2;
  return Math.abs(total);
}

export function polygonAreaSquareFeet(coords) {
  return polygonAreaSquareMeters(coords) * SQM_TO_SQFT;
}

// Get the centroid of a polygon — useful for placing a marker.
export function polygonCentroid(coords) {
  if (!coords || coords.length === 0) return null;
  const sum = coords.reduce(
    (acc, p) => ({
      latitude: acc.latitude + p.latitude,
      longitude: acc.longitude + p.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );
  return {
    latitude: sum.latitude / coords.length,
    longitude: sum.longitude / coords.length,
  };
}
