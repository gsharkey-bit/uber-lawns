// Seed data used to make the app feel alive without a backend.

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
    {
      id: 'm3',
      name: 'Casey Park',
      email: 'casey@example.com',
      rating: 4.3,
      jobsCompleted: 27,
      tiers: ['standard'],
      bio: 'Reliable, friendly, and fast.',
    },
  ],
};

// A few demo jobs already in the queue so the mower app shows something
// the moment a user signs in.
export const mockSeedJobs = [
  {
    id: 'j_demo_1',
    customerId: 'c_demo_1',
    customerName: 'Pat Morgan',
    addressLabel: '88 Oakridge Lane',
    coordinate: { latitude: 37.78925, longitude: -122.4344 },
    squareFeet: 3200,
    tier: 'standard',
    priceEstimate: 66.0,
    durationMinutes: 36,
    notes: 'Front and back yard. Gate code 1234.',
    status: 'open',
    createdAt: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'j_demo_2',
    customerId: 'c_demo_2',
    customerName: 'Riley Chen',
    addressLabel: '12 Birch Court',
    coordinate: { latitude: 37.78525, longitude: -122.4382 },
    squareFeet: 5400,
    tier: 'pro',
    priceEstimate: 148.5,
    durationMinutes: 60,
    notes: 'Please bag the clippings.',
    status: 'open',
    createdAt: Date.now() - 1000 * 60 * 12,
  },
];
