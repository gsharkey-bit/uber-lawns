// Price estimator for Uber Lawns.
// Final pricing rules from product spec:
//   base $10 + $0.013/sqft, tier multiplier, Thu/Fri surge ×1.20,
//   minimum $22, platform takes 22% of base (0% of tips).
// Recurring discounts: weekly −10%, biweekly −5%.
// Neighbor-batch discount: −10% when 2+ jobs on the same street get
// the same time window (mower batches them).
// Tips go 100% to the mower.

export const TIERS = {
  standard: {
    id: 'standard',
    label: 'Standard',
    description: 'Reliable mowers with solid ratings.',
    multiplier: 1.0,
    minRating: 4.0,
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    description: 'Top-rated, fully insured, sharper finish.',
    multiplier: 1.5,
    minRating: 4.7,
  },
  black: {
    id: 'black',
    label: 'Lawn Black',
    description: 'Elite landscapers. Stripe patterns, edging, blowdown.',
    multiplier: 2.2,
    minRating: 4.9,
  },
};

export const FREQUENCIES = {
  once: { id: 'once', label: 'One-time', discount: 0 },
  weekly: { id: 'weekly', label: 'Every week', discount: 0.10 },
  biweekly: { id: 'biweekly', label: 'Every 2 weeks', discount: 0.05 },
  monthly: { id: 'monthly', label: 'Monthly', discount: 0 },
};

export const BASE_FEE = 10;
export const PRICE_PER_SQFT = 0.013;
export const SURGE_MULT = 1.20;
export const SURGE_DAYS = [4, 5]; // Thu, Fri
export const MIN_PRICE = 22;
export const PLATFORM_PCT = 0.22;        // platform cut of base
export const NEIGHBOR_BATCH_DISCOUNT = 0.10;
export const MIN_DURATION_MIN = 20;
export const SQFT_PER_MINUTE = 90;

export function isSurgeDay(dayOfWeek) {
  return SURGE_DAYS.includes(dayOfWeek);
}

export function estimatePrice(squareFeet, options = {}) {
  const {
    tierId = 'standard',
    scheduledDay = new Date().getDay(),
    frequencyId = 'once',
    neighborBatch = false,
  } = options;
  const tier = TIERS[tierId] || TIERS.standard;
  const freq = FREQUENCIES[frequencyId] || FREQUENCIES.once;
  const surge = isSurgeDay(scheduledDay) ? SURGE_MULT : 1;
  const recurringMult = 1 - (freq.discount || 0);
  const batchMult = neighborBatch ? 1 - NEIGHBOR_BATCH_DISCOUNT : 1;
  const raw = (BASE_FEE + squareFeet * PRICE_PER_SQFT) * tier.multiplier * surge * recurringMult * batchMult;
  return Math.max(MIN_PRICE, Math.round(raw * 100) / 100);
}

export function priceBreakdown(squareFeet, options = {}) {
  const base = estimatePrice(squareFeet, options);
  const mowerEarn = Math.round(base * (1 - PLATFORM_PCT) * 100) / 100;
  const platformTake = Math.round(base * PLATFORM_PCT * 100) / 100;
  return { base, mowerEarn, platformTake };
}

export function estimateDurationMinutes(squareFeet) {
  return Math.max(MIN_DURATION_MIN, Math.round(squareFeet / SQFT_PER_MINUTE));
}

// Neighbor batch detection — looks for another job within ~250m on the
// same street name at the same time window. Returns true if eligible.
export function isNeighborBatchEligible(thisJob, otherJobs) {
  if (!thisJob.coordinate) return false;
  const thisStreet = (thisJob.addressLabel || '').split(/\d/)[1] || '';
  return otherJobs.some((other) => {
    if (other.id === thisJob.id) return false;
    if (other.status === 'cancelled' || other.status === 'rated') return false;
    if (other.scheduledSlot !== thisJob.scheduledSlot) return false;
    const otherStreet = (other.addressLabel || '').split(/\d/)[1] || '';
    if (thisStreet && otherStreet && thisStreet.trim() === otherStreet.trim()) return true;
    if (!other.coordinate || !thisJob.coordinate) return false;
    // Distance check: rough degrees-to-meters at mid-latitudes
    const dLat = (other.coordinate.latitude - thisJob.coordinate.latitude) * 111000;
    const dLng = (other.coordinate.longitude - thisJob.coordinate.longitude) * 85000;
    return Math.hypot(dLat, dLng) < 250;
  });
}

export function formatUsd(amount) {
  return `$${amount.toFixed(2)}`;
}

export function formatSqft(sqft) {
  return `${Math.round(sqft).toLocaleString()} sq ft`;
}
