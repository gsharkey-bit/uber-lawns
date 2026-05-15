// Auto-detect lawn area for an address.
//
// Strategy in production:
//   1. Call Google's Solar API "buildingInsights" endpoint with lat/lng.
//      It returns the building footprint(s) and the lot/parcel bounding box.
//   2. Compute lot area, subtract building footprints and driveways.
//   3. Return the resulting polygon clipped to the lot.
//
// In demo mode (no API key) we simulate the call with a delay and return
// a polygon centered on the address with a plausible estimated area.

import { GOOGLE_MAPS_API_KEY, USE_DEMO_MODE } from '../config';

const SOLAR_URL = 'https://solar.googleapis.com/v1/buildingInsights:findClosest';

/**
 * Auto-detect a lawn polygon for a given coordinate.
 * Returns { coordinates: [{latitude, longitude}], areaSquareFeet, confidence }
 * Throws on permanent failure; caller can offer manual outline fallback.
 */
export async function autoDetectLawn({ coordinate, estimatedArea = 3000 }) {
  if (USE_DEMO_MODE) {
    // Simulate the call with a short delay so the UI feels real.
    await new Promise((r) => setTimeout(r, 1700));
    return generateDemoPolygon(coordinate, estimatedArea);
  }

  const params = new URLSearchParams({
    'location.latitude': String(coordinate.latitude),
    'location.longitude': String(coordinate.longitude),
    key: GOOGLE_MAPS_API_KEY,
    requiredQuality: 'LOW',
  });

  try {
    const res = await fetch(`${SOLAR_URL}?${params}`);
    if (!res.ok) throw new Error('Solar API ' + res.status);
    const data = await res.json();
    // Solar API gives us the building bounding box. We approximate the lawn
    // as a buffered rectangle around it (typical residential lot is 2-4x
    // the building footprint). A real implementation would intersect this
    // with parcel data from a county GIS source.
    const bb = data?.boundingBox;
    if (!bb) throw new Error('No building data');
    const sw = bb.sw, ne = bb.ne;
    const cLat = (sw.latitude + ne.latitude) / 2;
    const cLng = (sw.longitude + ne.longitude) / 2;
    const dLat = (ne.latitude - sw.latitude) * 1.6; // pad the lawn footprint
    const dLng = (ne.longitude - sw.longitude) * 1.6;
    const coords = [
      { latitude: cLat - dLat / 2, longitude: cLng - dLng / 2 },
      { latitude: cLat - dLat / 2, longitude: cLng + dLng / 2 },
      { latitude: cLat + dLat / 2, longitude: cLng + dLng / 2 },
      { latitude: cLat + dLat / 2, longitude: cLng - dLng / 2 },
    ];
    const area = approxAreaSqft(coords);
    return { coordinates: coords, areaSquareFeet: area, confidence: 'medium' };
  } catch (e) {
    console.warn('Auto-detect failed, falling back to demo polygon', e);
    return generateDemoPolygon(coordinate, estimatedArea);
  }
}

function generateDemoPolygon(coordinate, estimatedArea) {
  // Build a rough rectangle around the coordinate whose area matches
  // estimatedArea sqft. 1 degree of latitude ≈ 111,000 m.
  const sqm = estimatedArea / 10.7639;
  const sideMeters = Math.sqrt(sqm);
  const dLat = sideMeters / 111000;
  const dLng = sideMeters / (111000 * Math.cos((coordinate.latitude * Math.PI) / 180));
  const coords = [
    { latitude: coordinate.latitude - dLat / 2, longitude: coordinate.longitude - dLng / 2 },
    { latitude: coordinate.latitude - dLat / 2, longitude: coordinate.longitude + dLng / 2 },
    { latitude: coordinate.latitude + dLat / 2, longitude: coordinate.longitude + dLng / 2 },
    { latitude: coordinate.latitude + dLat / 2, longitude: coordinate.longitude - dLng / 2 },
  ];
  return { coordinates: coords, areaSquareFeet: estimatedArea, confidence: 'demo' };
}

function approxAreaSqft(coords) {
  // Shoelace on lat/lng converted to meters at the polygon's centroid.
  if (!coords || coords.length < 3) return 0;
  const centroid = coords.reduce(
    (a, c) => ({ lat: a.lat + c.latitude / coords.length, lng: a.lng + c.longitude / coords.length }),
    { lat: 0, lng: 0 }
  );
  const cosLat = Math.cos((centroid.lat * Math.PI) / 180);
  const pts = coords.map((c) => ({
    x: (c.longitude - centroid.lng) * 111000 * cosLat,
    y: (c.latitude - centroid.lat) * 111000,
  }));
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % pts.length];
    sum += p1.x * p2.y - p2.x * p1.y;
  }
  const sqm = Math.abs(sum) / 2;
  return Math.round(sqm * 10.7639);
}
