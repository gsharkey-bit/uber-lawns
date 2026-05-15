import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import {
  TIERS, FREQUENCIES, estimatePrice, priceBreakdown, estimateDurationMinutes,
  formatSqft, formatUsd, isSurgeDay, isNeighborBatchEligible,
} from '../../utils/pricing';
import { polygonCentroid } from '../../utils/geometry';
import { colors, radii, spacing } from '../../theme/colors';

export default function RequestJobScreen({ route, navigation }) {
  const { squareFeet, polygon, holes = [], address, coordinate, measurementSource, schedule, frequency } = route.params;
  const { user } = useAuth();
  const { createJob, jobs } = useJobs();
  const [tier, setTier] = useState('standard');
  const [notes, setNotes] = useState('');

  const neighborBatch = isNeighborBatchEligible(
    { id: '_new', addressLabel: address, coordinate, scheduledSlot: schedule.label },
    jobs
  );

  const opts = { tierId: tier, scheduledDay: schedule.day, frequencyId: frequency, neighborBatch };
  const { base, mowerEarn, platformTake } = priceBreakdown(squareFeet, opts);
  const duration = estimateDurationMinutes(squareFeet);
  const center = coordinate || polygonCentroid(polygon);

  const onConfirm = () => {
    const job = createJob({
      customerId: user.id,
      customerName: user.name,
      addressLabel: address,
      coordinate: center,
      polygon,
      holes,
      squareFeet,
      tier,
      priceEstimate: base,
      mowerEarn,
      platformTake,
      durationMinutes: duration,
      notes,
      frequency,
      scheduledSlot: schedule.label,
      scheduledDay: schedule.day,
      measurementSource,
      neighborBatch,
    });
    navigation.replace('JobStatus', { jobId: job.id });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Confirm your job</Text>

        <View style={styles.summary}>
          <Row label="Address" value={address} />
          <Row label="Lawn size" value={`${formatSqft(squareFeet)}${measurementSource === 'auto' ? ' (auto)' : ' (manual)'}`} />
          <Row label="When" value={schedule.label} />
          <Row label="Frequency" value={FREQUENCIES[frequency].label} />
          <Row label="Est. duration" value={`${duration} min`} />
          {isSurgeDay(schedule.day) ? <Row label="Demand surge" value="×1.2 (Thu/Fri)" highlight /> : null}
          {FREQUENCIES[frequency].discount ? <Row label="Recurring discount" value={`−${Math.round(FREQUENCIES[frequency].discount * 100)}%`} discount /> : null}
          {neighborBatch ? <Row label="Neighbor batch" value="−10%" discount /> : null}
          <View style={styles.divider} />
          <Row label={`Price${frequency !== 'once' ? ' per mow' : ''}`} value={formatUsd(base)} bold />
        </View>

        {neighborBatch ? (
          <View style={styles.batchBanner}>
            <Ionicons name="people" size={18} color={colors.primaryDark} />
            <Text style={styles.batchText}>
              A neighbor booked the same time slot. You both save 10%.
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Choose a tier</Text>
        <View style={styles.tierRow}>
          {Object.values(TIERS).map((t) => {
            const isSel = tier === t.id;
            const tp = estimatePrice(squareFeet, { ...opts, tierId: t.id });
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.tier, isSel && styles[`tierSel_${t.id}`]]}
                onPress={() => setTier(t.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.tierLabel}>{t.label}</Text>
                <Text style={styles.tierPrice}>{formatUsd(tp)}</Text>
                <Text style={styles.tierDesc}>{t.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Notes (optional)</Text>
        <TextInput
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
          placeholder="Gate code, dog in yard, please bag clippings, etc."
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <PrimaryButton
          label={`Request mow · ${formatUsd(base)}${frequency !== 'once' ? '/mow' : ''}`}
          onPress={onConfirm}
          style={{ marginTop: spacing.lg }}
        />
        <Text style={styles.hint}>
          {frequency === 'once'
            ? 'Tip is optional and goes 100% to your mower.'
            : "We'll charge after each mow. Skip or cancel anytime."}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold, highlight, discount }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[
        styles.rowValue,
        bold && { fontWeight: '800', fontSize: 18 },
        highlight && { color: '#BF360C' },
        discount && { color: colors.primary },
      ]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  summary: {
    backgroundColor: colors.surface, borderRadius: radii.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  divider: { borderTopWidth: 1, borderTopColor: '#F0F2F0', marginTop: 4, paddingTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, gap: spacing.md },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontWeight: '600', fontSize: 14, flexShrink: 1, textAlign: 'right' },
  batchBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#EFF7EF', padding: spacing.md, borderRadius: radii.md,
    marginTop: spacing.md, borderWidth: 1, borderColor: '#A5D6A7',
  },
  batchText: { flex: 1, color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontWeight: '800', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  tierRow: { flexDirection: 'row', gap: spacing.sm },
  tier: { flex: 1, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  tierSel_standard: { borderColor: colors.primary, backgroundColor: '#EFF7EF' },
  tierSel_pro: { borderColor: colors.accent, backgroundColor: '#FFF8E1' },
  tierSel_black: { borderColor: colors.proPurple, backgroundColor: '#F3E5F5' },
  tierLabel: { fontSize: 12, fontWeight: '700', color: colors.text },
  tierPrice: { fontSize: 16, fontWeight: '800', marginTop: 2, color: colors.text },
  tierDesc: { fontSize: 11, color: colors.textMuted, marginTop: 3, lineHeight: 14 },
  input: {
    backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 16, color: colors.text,
    textAlignVertical: 'top', minHeight: 80,
  },
  hint: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 8 },
});
