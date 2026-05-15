// Auto-detect lawn area for an address.
//
// Production pipeline:
//   1. Google Solar API gives us the building bounding box (lot approximation).
//   2. OpenStreetMap Overpass API gives us the actual building footprint
//      (a more detailed polygon than the Solar bbox).
//   3. We expand the building bbox to estimate the lot, then return a lawn
//      polygon that fills the lot with the building footprint as a "hole".
//   4. A 15% area reduction accounts for driveways and walkways.
//
// If either upstream call fails we fall back to a simple rectangle around
// the address with no hole.

import { GOOGLE_MAPS_API_KEY, USE_DEMO_MODE } from '../config';

const SOLAR_URL = 'https://solar.googleapis.com/v1/buildingInsights:findClosest';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const DRIVEWAY_BUFFER = 0.85; // we keep 85% of the open area; rest is driveway/walks

export async function autoDetectLawn({ coordinate, estimatedArea = 3000 }) {
  if (USE_DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    return generateDemoPolygon(coordinate, estimatedArea);
  }

  const [solarResult, buildingResult] = await Promise.allSettled([
    fetchSolarBoundingBox(coordinate),
    fetchOverpassBuilding(coordinate),
  ]);

  const solarBox = solarResult.status === 'fulfilled' ? solarResult.value : null;
  const buildingPoly = buildingResult.status === 'fulfilled' ? buildingResult.value : null;

  if (!solarBox && !buildingPoly) {
    console.warn('Auto-detect: both sources failed, falling back');
    return generateDemoPolygon(coordinate, estimatedArea);
  }

  // Build the lot polygon. Use Solar bbox if we have it; otherwise expand
  // the building polygon's own bounding box.
  const lotBox = solarBox || boundingBoxOf(buildingPoly);
  const lotPolygon = expandBoxToLot(lotBox, coordinate);

  const lotArea = polygonAreaSqft(lotPolygon);
  const buildingArea = buildingPoly ? polygonAreaSqft(buildingPoly) : 0;
  const lawnArea = Math.max(200, Math.round((lotArea - buildingArea) * DRIVEWAY_BUFFER));

  return {
    coordinates: lotPolygon,                 // outer ring
    holes: buildingPoly ? [buildingPoly] : [], // building cut-out
    areaSquareFeet: lawnArea,
    confidence: buildingPoly && solarBox ? 'high' : buildingPoly ? 'medium' : 'low',
    sources: {
      solar: !!solarBox,
      building: !!buildingPoly,
    },
  };
}

async function fetchSolarBoundingBox(coordinate) {
  const params = new URLSearchParams({
    'location.latitude': String(coordinate.latitude),
    'location.longitude': String(coordinate.longitude),
    key: GOOGLE_MAPS_API_KEY,
    requiredQuality: 'LOW',
  });
  const res = await fetch(`${SOLAR_URL}?${params}`);
  if (!res.ok) throw new Error('Solar API ' + res.status);
  const data = await res.json();
  if (!data.boundingBox) throw new Error('No bbox');
  return data.boundingBox;
}

async function fetchOverpassBuilding(coordinate) {
  const lat = coordinate.latitude;
  const lng = coordinate.longitude;
  // Query buildings within 40m of the coordinate. 40m is wide enough to catch
  // the house even if the lat/lng is slightly off-center, but narrow enough
  // to avoid returning neighbors.
  const query = `[out:json][timeout:15];way(around:40,${lat},${lng})["building"];out geom;`;
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error('Overpass ' + res.status);
  const data = await res.json();
  if (!data.elements || data.elements.length === 0) throw new Error('No buildings in area');

  // Pick the building whose centroid is closest to the requested coordinate.
  let best = null;
  for (const el of data.elements) {
    if (!el.geometry || el.geometry.length < 3) continue;
    const cLat = el.geometry.reduce((s, p) => s + p.lat, 0) / el.geometry.length;
    const cLng = el.geometry.reduce((s, p) => s + p.lon, 0) / el.geometry.length;
    const dist = Math.hypot(coordinate.latitude - cLat, coordinate.longitude - cLng);
    if (!best || dist < best.dist) best = { dist, geom: el.geometry };
  }
  if (!best) throw new Error('No building polygon found');
  return best.geom.map((p) => ({ latitude: p.lat, longitude: p.lon }));
}

function boundingBoxOf(polygon) {
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const p of polygon) {
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
  }
  return {
    sw: { latitude: minLat, longitude: minLng },
    ne: { latitude: maxLat, longitude: maxLng },
  };
}

function expandBoxToLot(bbox, coordinate) {
  // Expand the building bbox by 1.7x to approximate a residential lot.
  const cLat = (bbox.sw.latitude + bbox.ne.latitude) / 2;
  const cLng = (bbox.sw.longitude + bbox.ne.longitude) / 2;
  const dLat = (bbox.ne.latitude - bbox.sw.latitude) * 1.7;
  const dLng = (bbox.ne.longitude - bbox.sw.longitude) * 1.7;
  // Floor it so very small bboxes still produce a useable lot (~20×25m).
  const minDLat = 20 / 111000;
  const minDLng = 25 / (111000 * Math.cos((coordinate.latitude * Math.PI) / 180));
  const finalDLat = Math.max(dLat, minDLat);
  const finalDLng = Math.max(dLng, minDLng);
  return [
    { latitude: cLat - finalDLat / 2, longitude: cLng - finalDLng / 2 },
    { latitude: cLat - finalDLat / 2, longitude: cLng + finalDLng / 2 },
    { latitude: cLat + finalDLat / 2, longitude: cLng + finalDLng / 2 },
    { latitude: cLat + finalDLat / 2, longitude: cLng - finalDLng / 2 },
  ];
}

function generateDemoPolygon(coordinate, estimatedArea) {
  const sqm = estimatedArea / 10.7639;
  const sideMeters = Math.sqrt(sqm);
  const dLat = sideMeters / 111000;
  const dLng = sideMeters / (111000 * Math.cos((coordinate.latitude * Math.PI) / 180));
  return {
    coordinates: [
      { latitude: coordinate.latitude - dLat / 2, longitude: coordinate.longitude - dLng / 2 },
      { latitude: coordinate.latitude - dLat / 2, longitude: coordinate.longitude + dLng / 2 },
      { latitude: coordinate.latitude + dLat / 2, longitude: coordinate.longitude + dLng / 2 },
      { latitude: coordinate.latitude + dLat / 2, longitude: coordinate.longitude - dLng / 2 },
    ],
    holes: [],
    areaSquareFeet: estimatedArea,
    confidence: 'demo',
    sources: { solar: false, building: false },
  };
}

// Shoelace area for a lat/lng polygon, returned in square feet.
export function polygonAreaSqft(coords) {
  if (!coords || coords.length < 3) return 0;
  const cLat = coords.reduce((s, c) => s + c.latitude / coords.length, 0);
  const cosLat = Math.cos((cLat * Math.PI) / 180);
  const pts = coords.map((c) => ({
    x: c.longitude * 111000 * cosLat,
    y: c.latitude * 111000,
  }));
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % pts.length];
    sum += p1.x * p2.y - p2.x * p1.y;
  }
  return Math.round((Math.abs(sum) / 2) * 10.7639);
}

// Area of a polygon with holes (outer minus all holes), in sqft.
export function lawnArea(outer, holes = []) {
  let area = polygonAreaSqft(outer);
  for (const h of holes) area -= polygonAreaSqft(h);
  return Math.max(0, Math.round(area * DRIVEWAY_BUFFER));
}
