import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/colors';
import { TIERS, formatUsd, formatSqft } from '../utils/pricing';

const STATUS_LABELS = {
  open: 'Looking for mower',
  confirming: 'Mower verifying lawn',
  accepted: 'Mower on the way',
  in_progress: 'Mowing in progress',
  completed: 'Completed — rate your mower',
  rated: 'Completed',
  tipped: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS = {
  open: colors.accent,
  confirming: colors.primary,
  accepted: colors.primary,
  in_progress: colors.primary,
  completed: colors.primaryDark,
  rated: colors.textMuted,
  tipped: colors.textMuted,
  cancelled: colors.danger,
};

/**
 * JobCard
 *   viewerRole = 'customer' (default) → shows the customer's total (base + tip)
 *   viewerRole = 'mower'              → shows mower take-home (mowerEarn + tip)
 *                                       and prefixes with "You earn"
 */
export default function JobCard({ job, onPress, ctaLabel, viewerRole = 'customer' }) {
  const tier = TIERS[job.tier] || TIERS.standard;
  const tipped = job.tip || 0;

  const priceLabel = viewerRole === 'mower'
    ? `You earn ${formatUsd((job.mowerEarn || 0) + tipped)}`
    : formatUsd((job.priceEstimate || 0) + tipped);

  const priceColor = viewerRole === 'mower' ? { color: colors.primary } : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        <Ionicons name="leaf" size={18} color={colors.primary} />
        <Text style={styles.address} numberOfLines={1}>{job.addressLabel}</Text>
        <Text style={[styles.price, priceColor]}>{priceLabel}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{formatSqft(job.squareFeet)}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.meta}>{job.durationMinutes} min</Text>
        <Text style={styles.dot}>•</Text>
        <Text
          style={[
            styles.tierBadge,
            job.tier === 'black' && { color: colors.proPurple },
            job.tier === 'pro' && { color: colors.accent },
          ]}
        >
          {tier.label}
        </Text>
      </View>

      {job.scheduledSlot ? (
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={styles.meta}>{job.scheduledSlot}</Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[job.status] || colors.textMuted }]} />
        <Text style={styles.status}>{STATUS_LABELS[job.status] || job.status}</Text>
      </View>

      {ctaLabel ? (
        <View style={styles.cta}>
          <Text style={styles.ctaText}>{ctaLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radii.md,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  address: { flex: 1, fontWeight: '700', color: colors.text, marginLeft: 4 },
  price: { fontWeight: '800', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 6 },
  meta: { color: colors.textMuted, fontSize: 12 },
  dot: { color: colors.textMuted, fontSize: 12 },
  tierBadge: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  status: { color: colors.textMuted, fontSize: 12 },
  cta: { marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  ctaText: { color: colors.primary, fontWeight: '700' },
});
