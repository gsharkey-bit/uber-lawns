// Configuration for Uber Lawns.
//
// To enable real Google Maps features (address autocomplete, satellite tiles,
// auto-detect lawn area), get a Google Maps Platform key at
// https://console.cloud.google.com and paste it below.
//
// Without a key the app runs in DEMO MODE with preset addresses.

export const GOOGLE_MAPS_API_KEY = 'AIzaSyCm5NXOTvdhPTVSVwx-Zh0xxsWm5bITJFA';

export const USE_DEMO_MODE = !GOOGLE_MAPS_API_KEY;

// Preset demo addresses used when no API key is configured.
export const DEMO_ADDRESSES = [
  {
    label: '123 Maple St, Springfield',
    coordinate: { latitude: 37.78925, longitude: -122.4344 },
    layout: 'medium',
    estimatedArea: 3050,
  },
  {
    label: '456 Oak Avenue, Springfield',
    coordinate: { latitude: 37.79025, longitude: -122.4334 },
    layout: 'large',
    estimatedArea: 5450,
  },
  {
    label: '789 Pine Drive, Springfield',
    coordinate: { latitude: 37.78825, longitude: -122.4354 },
    layout: 'small',
    estimatedArea: 1800,
  },
  {
    label: '12 Elm Road, Springfield',
    coordinate: { latitude: 37.79125, longitude: -122.4314 },
    layout: 'large',
    estimatedArea: 6200,
  },
  {
    label: '555 Cedar Lane, Springfield',
    coordinate: { latitude: 37.78725, longitude: -122.4364 },
    layout: 'medium',
    estimatedArea: 2900,
  },
];
