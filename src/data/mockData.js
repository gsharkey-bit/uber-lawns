// Seed data used to make the app feel alive without a backend.

import { priceBreakdown, estimateDurationMinutes } from '../utils/pricing';

export const mockUsers = {
  customers: [
    { id: 'c1', name: 'Avery Lin', email: 'avery@example.com', addressLabel: '123 Maple St' },
  ],
  mowers: [
    {
      id: 'm1',
      name: 'Jordan Hayes',
      email: 'jordan@example.com',
      rating: 4.8,
      jobsCompleted: 142,
      tiers: ['standard', 'pro'],
      bio: 'Pro mower with 5 years experience. Insured.',
    },
    {
      id: 'm2',
      name: 'Sam Rivera',
      email: 'sam@example.com',
      rating: 4.95,
      jobsCompleted: 311,
      tiers: ['standard', 'pro', 'black'],
      bio: 'Lawn Black operator. Stripes, edging, full cleanup.',
    },
  ],
};

function makeJob({ id, customerName, addressLabel, coordinate, squareFeet, tier, scheduledDay, scheduledSlot, frequency = 'once', notes }) {
  const bp = priceBreakdown(squareFeet, { tierId: tier, scheduledDay, frequencyId: frequency });
  return {
    id,
    customerId: 'c_demo_' + id,
    customerName,
    addressLabel,
    coordinate,
    polygon: [],
    squareFeet,
    tier,
    priceEstimate: bp.base,
    mowerEarn: bp.mowerEarn,
    platformTake: bp.platformTake,
    durationMinutes: estimateDurationMinutes(squareFeet),
    notes,
    frequency,
    scheduledSlot,
    scheduledDay,
    measurementSource: 'auto',
    neighborBatch: false,
    status: 'open',
    tip: 0,
    chatMessages: [],
    createdAt: Date.now(),
  };
}

export const mockSeedJobs = [
  makeJob({
    id: 'jd1',
    customerName: 'Pat Morgan',
    addressLabel: '88 Oakridge Lane',
    coordinate: { latitude: 37.78925, longitude: -122.4344 },
    squareFeet: 3200,
    tier: 'standard',
    scheduledDay: 2,
    scheduledSlot: 'Tuesday, 12–3pm',
    notes: 'Front and back yard. Gate code 1234.',
  }),
  makeJob({
    id: 'jd2',
    customerName: 'Riley Chen',
    addressLabel: '12 Birch Court',
    coordinate: { latitude: 37.78525, longitude: -122.4382 },
    squareFeet: 5400,
    tier: 'pro',
    scheduledDay: 5,
    scheduledSlot: 'Friday, 3–6pm',
    frequency: 'biweekly',
    notes: 'Please bag clippings.',
  }),
];
