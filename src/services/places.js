// Google Places autocomplete + geocoding.
// Calls Google's REST endpoints directly so it works in Expo Go without
// any native modules. Falls back to preset addresses if no key is set.

import { GOOGLE_MAPS_API_KEY, USE_DEMO_MODE, DEMO_ADDRESSES } from '../config';

const AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

let sessionToken = null;
function newSessionToken() {
  sessionToken = Math.random().toString(36).slice(2) + Date.now();
  return sessionToken;
}

/**
 * Returns an array of address suggestions for the given query.
 * Shape: [{ placeId, label, layout?, coordinate?, estimatedArea? }]
 */
export async function searchAddresses(query) {
  if (!query || query.length < 2) return [];

  if (USE_DEMO_MODE) {
    const q = query.toLowerCase();
    return DEMO_ADDRESSES
      .filter((a) => a.label.toLowerCase().includes(q))
      .slice(0, 5)
      .map((a) => ({ placeId: `demo:${a.label}`, ...a }));
  }

  if (!sessionToken) newSessionToken();
  const params = new URLSearchParams({
    input: query,
    key: GOOGLE_MAPS_API_KEY,
    sessiontoken: sessionToken,
    types: 'address',
  });

  try {
    const res = await fetch(`${AUTOCOMPLETE_URL}?${params}`);
    const data = await res.json();
    if (data.status !== 'OK') return [];
    return (data.predictions || []).slice(0, 5).map((p) => ({
      placeId: p.place_id,
      label: p.description,
    }));
  } catch (e) {
    console.warn('Places autocomplete failed', e);
    return [];
  }
}

/**
 * Fetch the lat/lng for a place ID.
 * Returns { coordinate: { latitude, longitude } }.
 */
export async function getPlaceDetails(placeId) {
  if (USE_DEMO_MODE || placeId.startsWith('demo:')) {
    const label = placeId.replace(/^demo:/, '');
    const match = DEMO_ADDRESSES.find((a) => a.label === label);
    return match || null;
  }

  const params = new URLSearchParams({
    place_id: placeId,
    key: GOOGLE_MAPS_API_KEY,
    sessiontoken: sessionToken || '',
    fields: 'geometry,formatted_address',
  });

  try {
    const res = await fetch(`${PLACE_DETAILS_URL}?${params}`);
    const data = await res.json();
    newSessionToken(); // reset session token after details call (billing)
    if (data.status !== 'OK') return null;
    const r = data.result;
    return {
      label: r.formatted_address,
      coordinate: {
        latitude: r.geometry.location.lat,
        longitude: r.geometry.location.lng,
      },
    };
  } catch (e) {
    console.warn('Place details failed', e);
    return null;
  }
}
