import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from '../../components/RatingStars';
import PrimaryButton from '../../components/PrimaryButton';
import { useJobs } from '../../context/JobsContext';
import { TIERS, formatUsd, formatSqft } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

const STEPS = ['open', 'accepted', 'in_progress', 'completed'];
const STEP_LABELS = {
  open: 'Finding a mower',
  accepted: 'Mower on the way',
  in_progress: 'Mowing in progress',
  completed: 'All done!',
};

export default function JobStatusScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { jobs, rateJob, cancelJob } = useJobs();
  const job = jobs.find((j) => j.id === jobId);
  const [rating, setRating] = useState(0);

  if (!job) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.empty}>Job not found.</Text>
      </SafeAreaView>
    );
  }

  const tier = TIERS[job.tier] || TIERS.standard;
  const currentStep = STEPS.indexOf(job.status === 'rated' ? 'completed' : job.status);

  const onSubmitRating = () => {
    if (rating === 0) return;
    rateJob(job.id, rating);
    Alert.alert('Thanks!', 'Your rating helps mowers build their reputation.');
    navigation.goBack();
  };

  const onCancel = () => {
    Alert.alert('Cancel job?', 'You can request again any time.', [
      { text: 'Keep job', style: 'cancel' },
      {
        text: 'Cancel job',
        style: 'destructive',
        onPress: () => {
          cancelJob(job.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{STEP_LABELS[job.status] || job.status}</Text>
        <Text style={styles.subtitle}>{job.addressLabel}</Text>

        <View style={styles.tracker}>
          {STEPS.map((step, idx) => {
            const done = idx <= currentStep;
            return (
              <View key={step} style={styles.step}>
                <View
                  style={[
                    styles.stepDot,
                    done && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  {done ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
                </View>
                <Text style={[styles.stepLabel, done && { color: colors.text, fontWeight: '700' }]}>
                  {STEP_LABELS[step]}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Row label="Tier" value={tier.label} />
          <Row label="Lawn size" value={formatSqft(job.squareFeet)} />
          <Row label="Est. duration" value={`${job.durationMinutes} min`} />
          <Row label="Price" value={formatUsd(job.priceEstimate)} bold />
          {job.notes ? <Row label="Notes" value={job.notes} /> : null}
        </View>

        {job.mowerName ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your mower</Text>
            <View style={styles.mowerRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mowerName}>{job.mowerName}</Text>
                <RatingStars value={job.mowerRating || 0} size={14} />
              </View>
            </View>
          </View>
        ) : null}

        {job.status === 'completed' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Rate your mower</Text>
            <RatingStars value={rating} size={32} onChange={setRating} />
            <PrimaryButton
              label="Submit rating"
              disabled={rating === 0}
              onPress={onSubmitRating}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : null}

        {['open', 'accepted'].includes(job.status) ? (
          <PrimaryButton
            label="Cancel job"
            variant="outline"
            onPress={onCancel}
            style={{ marginTop: spacing.lg }}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && { fontWeight: '800' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  empty: { padding: spacing.lg, color: colors.textMuted },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 2, marginBottom: spacing.lg },
  tracker: { marginBottom: spacing.lg, gap: 12 },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: { color: colors.textMuted, fontSize: 14 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  rowLabel: { color: colors.textMuted },
  rowValue: { color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  sectionTitle: { fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  mowerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mowerName: { fontWeight: '700', color: colors.text },
});
