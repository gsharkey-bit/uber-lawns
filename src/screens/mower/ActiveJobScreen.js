import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { useJobs } from '../../context/JobsContext';
import { formatSqft, formatUsd } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

const STATUS_HELP = {
  accepted: 'Head over to the customer. Tap "Start mowing" when you arrive.',
  in_progress: 'Mowing in progress. Tap "Mark complete" when the lawn is done.',
  completed: 'Job complete. Waiting for the customer to leave a rating and tip.',
  rated: 'Customer rated you. They may still tip.',
  tipped: 'All done — payout posted to your account.',
};

export default function ActiveJobScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { jobs, startJob, completeJob } = useJobs();
  const job = jobs.find((j) => j.id === jobId);

  if (!job) return <SafeAreaView style={styles.safe}><Text style={styles.empty}>Job not found.</Text></SafeAreaView>;

  const onStart = () => startJob(job.id);
  const onComplete = () => {
    Alert.alert('Mark complete?', 'The customer will be asked to rate and tip.', [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Mark complete', onPress: () => completeJob(job.id) },
    ]);
  };

  const earned = job.mowerEarn + (job.tip || 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{job.addressLabel}</Text>
            <Text style={styles.helper}>{STATUS_HELP[job.status] || job.status}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Chat', { jobId: job.id })} style={styles.chatBtn}>
            <Ionicons name="chatbubble-ellipses" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Row label="Customer" value={job.customerName} />
          <Row label="Lawn size" value={formatSqft(job.squareFeet)} />
          <Row label="Duration" value={`${job.durationMinutes} min`} />
          <View style={styles.divider} />
          <Row label="Payout" value={formatUsd(job.mowerEarn)} />
          {job.tip ? <Row label="Tip from customer" value={`+${formatUsd(job.tip)}`} highlight /> : null}
          {job.tip ? (
            <>
              <View style={styles.divider} />
              <Row label="Total you earn" value={formatUsd(earned)} bold />
            </>
          ) : null}
          {job.notes ? <Row label="Notes" value={job.notes} /> : null}
        </View>

        {job.status === 'accepted' ? <PrimaryButton label="Start mowing" onPress={onStart} /> : null}
        {job.status === 'in_progress' ? <PrimaryButton label="Mark complete" onPress={onComplete} /> : null}
        {['completed', 'rated', 'tipped'].includes(job.status) ? (
          <PrimaryButton label="Back to home" variant="outline" onPress={() => navigation.popToTop()} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, bold, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && { fontWeight: '800', fontSize: 18 }, highlight && { color: colors.primary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  empty: { padding: spacing.lg, color: colors.textMuted },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: 8 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  helper: { color: colors.textMuted, marginTop: 4 },
  chatBtn: { padding: 6 },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  divider: { borderTopWidth: 1, borderTopColor: '#F0F2F0', marginTop: 4, paddingTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, gap: spacing.md },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontWeight: '600', fontSize: 14, flexShrink: 1, textAlign: 'right' },
});
