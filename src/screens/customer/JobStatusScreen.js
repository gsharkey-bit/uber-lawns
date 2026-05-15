import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from '../../components/RatingStars';
import PrimaryButton from '../../components/PrimaryButton';
import { useJobs } from '../../context/JobsContext';
import { TIERS, FREQUENCIES, formatUsd, formatSqft, isSurgeDay } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

const STEPS = ['open', 'accepted', 'in_progress', 'completed'];
const STEP_LABELS = {
  open: 'Finding a mower',
  accepted: 'Mower on the way',
  in_progress: 'Mowing in progress',
  completed: 'All done!',
};
const STATUS_LABELS = {
  open: 'Finding a mower',
  confirming: 'Mower verifying lawn outline',
  accepted: 'Mower on the way',
  in_progress: 'Mowing in progress',
  completed: 'Completed — rate your mower',
  rated: 'Completed',
  tipped: 'Completed',
  cancelled: 'Cancelled',
};

export default function JobStatusScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { jobs, rateJob, cancelJob } = useJobs();
  const job = jobs.find((j) => j.id === jobId);
  const [rating, setRating] = useState(0);

  if (!job) {
    return <SafeAreaView style={styles.safe}><Text style={styles.empty}>Job not found.</Text></SafeAreaView>;
  }

  const tier = TIERS[job.tier] || TIERS.standard;
  const currentStep = STEPS.indexOf(
    ['rated', 'tipped'].includes(job.status) ? 'completed' :
    job.status === 'confirming' ? 'accepted' : job.status
  );

  const onSubmitRating = () => {
    if (rating === 0) return;
    rateJob(job.id, rating);
    navigation.navigate('TipPicker', { jobId: job.id });
  };

  const onCancel = () => {
    Alert.alert('Cancel job?', 'You can request again any time.', [
      { text: 'Keep job', style: 'cancel' },
      { text: 'Cancel job', style: 'destructive', onPress: () => { cancelJob(job.id); navigation.goBack(); } },
    ]);
  };

  const total = job.priceEstimate + (job.tip || 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{STATUS_LABELS[job.status] || job.status}</Text>
            <Text style={styles.subtitle}>{job.addressLabel} · {job.scheduledSlot || 'ASAP'}</Text>
          </View>
          {job.mowerName && !['cancelled', 'open'].includes(job.status) ? (
            <TouchableOpacity onPress={() => navigation.navigate('Chat', { jobId: job.id })} style={styles.chatBtn}>
              <Ionicons name="chatbubble-ellipses" size={22} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.tracker}>
          {STEPS.map((step, idx) => {
            const done = idx <= currentStep;
            return (
              <View key={step} style={styles.step}>
                <View style={[styles.stepDot, done && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
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
          <Row label="Lawn size" value={`${formatSqft(job.squareFeet)}${job.measurementSource === 'auto' ? ' · auto' : ''}`} />
          <Row label="Frequency" value={FREQUENCIES[job.frequency || 'once']?.label || 'One-time'} />
          {isSurgeDay(job.scheduledDay) ? <Row label="Surge" value="×1.2" /> : null}
          {job.neighborBatch ? <Row label="Neighbor batch" value="−10%" /> : null}
          <Row label="Base price" value={formatUsd(job.priceEstimate)} />
          {job.tip ? <Row label="Tip" value={formatUsd(job.tip)} /> : null}
          <View style={styles.divider} />
          <Row label="Total" value={formatUsd(total)} bold />
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.mowerName}>{job.mowerName}</Text>
                  <View style={styles.verifiedChip}>
                    <Ionicons name="shield-checkmark" size={11} color={colors.primaryDark} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
                <RatingStars value={job.mowerRating || 0} size={14} />
              </View>
              <PrimaryButton
                label="Chat"
                variant="outline"
                onPress={() => navigation.navigate('Chat', { jobId: job.id })}
                style={{ paddingHorizontal: 14, paddingVertical: 6 }}
              />
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

        {['open', 'accepted', 'confirming'].includes(job.status) ? (
          <PrimaryButton label="Cancel job" variant="outline" onPress={onCancel} style={{ marginTop: spacing.md }} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && { fontWeight: '800', fontSize: 18 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  empty: { padding: spacing.lg, color: colors.textMuted },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 2 },
  chatBtn: { padding: 6 },
  tracker: { marginBottom: spacing.lg, gap: 10 },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  stepLabel: { color: colors.textMuted, fontSize: 14 },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  divider: { borderTopWidth: 1, borderTopColor: '#F0F2F0', marginTop: 4, paddingTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, gap: spacing.md },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontWeight: '600', fontSize: 14, flexShrink: 1, textAlign: 'right' },
  sectionTitle: { fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  mowerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  mowerName: { fontWeight: '700', color: colors.text },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: '#EFF7EF' },
  verifiedText: { fontSize: 10, color: colors.primaryDark, fontWeight: '700' },
});
