import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { useJobs } from '../../context/JobsContext';
import { formatSqft, formatUsd } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

const STATUS_HELP = {
  accepted: 'Head over to the customer. Tap "Start mowing" when you arrive.',
  in_progress: 'Mowing in progress. Tap "Mark complete" when the lawn is done.',
  completed: 'Job complete. Waiting for the customer to leave a rating.',
  rated: 'Customer left you a rating. Nice work!',
};

export default function ActiveJobScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { jobs, startJob, completeJob } = useJobs();
  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.empty}>Job not found.</Text>
      </SafeAreaView>
    );
  }

  const onStart = () => startJob(job.id);
  const onComplete = () => {
    Alert.alert('Mark complete?', 'The customer will be asked to rate the job.', [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Mark complete', onPress: () => completeJob(job.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{job.addressLabel}</Text>
        <Text style={styles.helper}>{STATUS_HELP[job.status] || job.status}</Text>

        <View style={styles.card}>
          <Row label="Customer" value={job.customerName} />
          <Row label="Lawn size" value={formatSqft(job.squareFeet)} />
          <Row label="Duration" value={`${job.durationMinutes} min`} />
          <Row label="Payout" value={formatUsd(job.priceEstimate * 0.8)} bold />
          {job.notes ? <Row label="Notes" value={job.notes} /> : null}
        </View>

        {job.status === 'accepted' ? (
          <PrimaryButton label="Start mowing" onPress={onStart} />
        ) : null}
        {job.status === 'in_progress' ? (
          <PrimaryButton label="Mark complete" onPress={onComplete} />
        ) : null}
        {['completed', 'rated'].includes(job.status) ? (
          <PrimaryButton
            label="Back to home"
            variant="outline"
            onPress={() => navigation.popToTop()}
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
      <Text style={[styles.rowValue, bold && { fontWeight: '800', fontSize: 18 }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  empty: { padding: spacing.lg, color: colors.textMuted },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  helper: { color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  rowLabel: { color: colors.textMuted },
  rowValue: { color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
});
