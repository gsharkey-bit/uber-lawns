// Auto-detect lawn area for an address.
//
// Pipeline:
//   1. Google Solar API → building bounding box (used as a lot approximation).
//   2. OpenStreetMap Overpass API → actual building footprint polygon.
//   3. Lot polygon (1.7x building bbox) with the building footprint as a hole.
//   4. 15% area reduction for driveways/walkways.
//
// This function NEVER throws. If both data sources fail, it returns a
// reasonable rectangular fallback so the user can adjust manually.

import { GOOGLE_MAPS_API_KEY, USE_DEMO_MODE } from '../config';

const SOLAR_URL = 'https://solar.googleapis.com/v1/buildingInsights:findClosest';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const DRIVEWAY_BUFFER = 0.85;
const FETCH_TIMEOUT_MS = 12000;

export async function autoDetectLawn({ coordinate, estimatedArea = 3000 }) {
  try {
    if (USE_DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 1200));
      return generateRectanglePolygon(coordinate, estimatedArea, 'demo');
    }
    if (!coordinate || typeof coordinate.latitude !== 'number') {
      console.warn('[autoDetect] no coordinate provided, returning fallback');
      return generateRectanglePolygon(coordinate || { latitude: 0, longitude: 0 }, estimatedArea, 'low');
    }

    const [solarResult, buildingResult] = await Promise.allSettled([
      withTimeout(fetchSolarBoundingBox(coordinate), FETCH_TIMEOUT_MS, 'solar'),
      withTimeout(fetchOverpassBuilding(coordinate), FETCH_TIMEOUT_MS, 'overpass'),
    ]);

    const solarBox = solarResult.status === 'fulfilled' ? solarResult.value : null;
    const buildingPoly = buildingResult.status === 'fulfilled' ? buildingResult.value : null;

    if (solarResult.status === 'rejected') {
      console.warn('[autoDetect] Solar failed:', solarResult.reason?.message || solarResult.reason);
    }
    if (buildingResult.status === 'rejected') {
      console.warn('[autoDetect] Overpass failed:', buildingResult.reason?.message || buildingResult.reason);
    }

    if (!solarBox && !buildingPoly) {
      console.warn('[autoDetect] both sources empty, using rectangle fallback');
      return generateRectanglePolygon(coordinate, estimatedArea, 'low');
    }

    const lotBox = solarBox || boundingBoxOf(buildingPoly);
    const lotPolygon = expandBoxToLot(lotBox, coordinate);

    const lotAreaSqft = polygonAreaSqft(lotPolygon);
    const buildingAreaSqft = buildingPoly ? polygonAreaSqft(buildingPoly) : 0;
    const lawnSqft = Math.max(200, Math.round((lotAreaSqft - buildingAreaSqft) * DRIVEWAY_BUFFER));

    return {
      coordinates: lotPolygon,
      holes: buildingPoly ? [buildingPoly] : [],
      areaSquareFeet: lawnSqft,
      confidence: buildingPoly && solarBox ? 'high' : buildingPoly ? 'medium' : 'medium',
      sources: { solar: !!solarBox, building: !!buildingPoly },
    };
  } catch (e) {
    console.warn('[autoDetect] unexpected error, falling back:', e?.message || e);
    return generateRectanglePolygon(
      coordinate || { latitude: 0, longitude: 0 },
      estimatedArea,
      'low'
    );
  }
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout after ${ms}ms`)), ms)),
  ]);
}

async function fetchSolarBoundingBox(coordinate) {
  const params = new URLSearchParams({
    'location.latitude': String(coordinate.latitude),
    'location.longitude': String(coordinate.longitude),
    key: GOOGLE_MAPS_API_KEY,
    requiredQuality: 'LOW',
  });
  const res = await fetch(`${SOLAR_URL}?${params}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error('Solar ' + res.status + ' ' + (data?.error?.message || ''));
  }
  if (!data || !data.boundingBox) throw new Error('Solar: no boundingBox in response');
  return data.boundingBox;
}

async function fetchOverpassBuilding(coordinate) {
  const lat = coordinate.latitude;
  const lng = coordinate.longitude;
  const query = `[out:json][timeout:10];way(around:50,${lat},${lng})["building"];out geom;`;
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error('Overpass ' + res.status);
  const data = await res.json().catch(() => null);
  if (!data?.elements?.length) throw new Error('Overpass: no buildings within 50m');

  let best = null;
  for (const el of data.elements) {
    if (!el.geometry || el.geometry.length < 3) continue;
    const cLat = el.geometry.reduce((s, p) => s + p.lat, 0) / el.geometry.length;
    const cLng = el.geometry.reduce((s, p) => s + p.lon, 0) / el.geometry.length;
    const dist = Math.hypot(coordinate.latitude - cLat, coordinate.longitude - cLng);
    if (!best || dist < best.dist) best = { dist, geom: el.geometry };
  }
  if (!best) throw new Error('Overpass: no usable building polygon');
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
  const cLat = (bbox.sw.latitude + bbox.ne.latitude) / 2;
  const cLng = (bbox.sw.longitude + bbox.ne.longitude) / 2;
  const dLat = (bbox.ne.latitude - bbox.sw.latitude) * 1.7;
  const dLng = (bbox.ne.longitude - bbox.sw.longitude) * 1.7;
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

function generateRectanglePolygon(coordinate, estimatedArea, confidence) {
  const sqm = estimatedArea / 10.7639;
  const sideMeters = Math.sqrt(sqm);
  const dLat = sideMeters / 111000;
  const cosLat = Math.cos((coordinate.latitude * Math.PI) / 180) || 1;
  const dLng = sideMeters / (111000 * cosLat);
  return {
    coordinates: [
      { latitude: coordinate.latitude - dLat / 2, longitude: coordinate.longitude - dLng / 2 },
      { latitude: coordinate.latitude - dLat / 2, longitude: coordinate.longitude + dLng / 2 },
      { latitude: coordinate.latitude + dLat / 2, longitude: coordinate.longitude + dLng / 2 },
      { latitude: coordinate.latitude + dLat / 2, longitude: coordinate.longitude - dLng / 2 },
    ],
    holes: [],
    areaSquareFeet: estimatedArea,
    confidence,
    sources: { solar: false, building: false },
  };
}

export function polygonAreaSqft(coords) {
  if (!coords || coords.length < 3) return 0;
  const cLat = coords.reduce((s, c) => s + c.latitude / coords.length, 0);
  const cosLat = Math.cos((cLat * Math.PI) / 180) || 1;
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

export function lawnArea(outer, holes = []) {
  if (!outer || outer.length < 3) return 0;
  let area = polygonAreaSqft(outer);
  for (const h of holes || []) area -= polygonAreaSqft(h);
  return Math.max(0, Math.round(area * DRIVEWAY_BUFFER));
}
