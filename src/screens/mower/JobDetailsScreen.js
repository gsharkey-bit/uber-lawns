import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import { TIERS, FREQUENCIES, formatSqft, formatUsd, isSurgeDay } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

export default function JobDetailsScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { user } = useAuth();
  const { jobs, acceptJob } = useJobs();
  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return <SafeAreaView style={styles.safe}><Text style={styles.empty}>This job is no longer available.</Text></SafeAreaView>;
  }
  if (!user.verified) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={{ color: colors.text }}>You must complete verification before accepting jobs.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tier = TIERS[job.tier] || TIERS.standard;
  const region = job.coordinate
    ? { ...job.coordinate, latitudeDelta: 0.003, longitudeDelta: 0.003 }
    : null;

  const onAccept = () => {
    acceptJob(job.id, user);
    navigation.replace('ConfirmOutline', { jobId: job.id });
  };
  const onPass = () => {
    Alert.alert('Pass on this job?', 'It will stay available for other mowers.', [
      { text: 'Keep looking', style: 'cancel' },
      { text: 'Pass', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{job.addressLabel}</Text>
        <View style={styles.tagsRow}>
          <Text style={[styles.tag, { color: tier.id === 'black' ? colors.proPurple : tier.id === 'pro' ? colors.accent : colors.primary }]}>
            {tier.label}
          </Text>
          {isSurgeDay(job.scheduledDay) ? <Text style={styles.surgeTag}>Surge ×1.2</Text> : null}
          {job.frequency && job.frequency !== 'once' ? <Text style={styles.recurringTag}>{FREQUENCIES[job.frequency].label}</Text> : null}
          {job.neighborBatch ? <Text style={styles.batchTag}>Neighbor batch</Text> : null}
          {job.measurementSource === 'auto' ? <Text style={styles.autoTag}>Auto-measured</Text> : null}
        </View>

        {region ? (
          <View style={styles.mapWrap}>
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={region}
              mapType="satellite"
            >
              {job.polygon && job.polygon.length >= 3 ? (
                <Polygon coordinates={job.polygon} strokeColor={colors.primary} fillColor="rgba(46,125,50,0.35)" strokeWidth={2} />
              ) : (
                <Marker coordinate={job.coordinate} />
              )}
            </MapView>
          </View>
        ) : null}

        <View style={styles.card}>
          <Row label="Customer" value={job.customerName} />
          <Row label="Scheduled" value={job.scheduledSlot || 'ASAP'} />
          <Row label="Lawn size" value={formatSqft(job.squareFeet)} />
          <Row label="Est. duration" value={`${job.durationMinutes} min`} />
          <View style={styles.divider} />
          <Row label="You earn per mow" value={formatUsd(job.mowerEarn)} highlight />
          <Text style={styles.subnote}>Tips on top, 100% yours.</Text>
        </View>

        {job.notes ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Customer notes</Text>
            <Text style={styles.notes}>{job.notes}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton label="Pass" variant="outline" onPress={onPass} style={{ flex: 1 }} />
          <PrimaryButton label="Accept job" onPress={onAccept} style={{ flex: 1.4 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && { fontWeight: '800', fontSize: 18, color: colors.primary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  empty: { padding: spacing.lg, color: colors.textMuted },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, marginBottom: spacing.md },
  tag: { fontWeight: '700' },
  surgeTag: { backgroundColor: '#FFE0B2', color: '#BF360C', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, fontSize: 11, fontWeight: '700' },
  recurringTag: { backgroundColor: '#E3F2FD', color: '#0D47A1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, fontSize: 11, fontWeight: '700' },
  batchTag: { backgroundColor: '#EFF7EF', color: colors.primaryDark, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, fontSize: 11, fontWeight: '700' },
  autoTag: { backgroundColor: '#F0F2F0', color: colors.textMuted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, fontSize: 11, fontWeight: '700' },
  mapWrap: { height: 200, borderRadius: radii.md, overflow: 'hidden', marginBottom: spacing.md, backgroundColor: '#000' },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  divider: { borderTopWidth: 1, borderTopColor: '#F0F2F0', marginTop: 4, paddingTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontWeight: '600', fontSize: 14 },
  subnote: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  sectionTitle: { fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  notes: { color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
