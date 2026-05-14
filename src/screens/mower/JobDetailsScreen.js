import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import { TIERS, formatSqft, formatUsd } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

export default function JobDetailsScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { user } = useAuth();
  const { jobs, acceptJob } = useJobs();
  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.empty}>This job is no longer available.</Text>
      </SafeAreaView>
    );
  }

  const tier = TIERS[job.tier] || TIERS.standard;

  const onAccept = () => {
    acceptJob(job.id, user);
    navigation.replace('ActiveJob', { jobId: job.id });
  };

  const onDecline = () => {
    Alert.alert('Pass on this job?', 'It will stay available for other mowers.', [
      { text: 'Keep looking', style: 'cancel' },
      { text: 'Pass', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const region = job.coordinate
    ? {
        ...job.coordinate,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      }
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{job.addressLabel}</Text>
        <Text style={styles.subtitle}>{tier.label} tier</Text>

        {region ? (
          <View style={styles.mapWrap}>
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={region}
              mapType="satellite"
            >
              {job.polygon ? (
                <Polygon
                  coordinates={job.polygon}
                  strokeColor={colors.primary}
                  fillColor="rgba(46,125,50,0.35)"
                  strokeWidth={2}
                />
              ) : (
                <Marker coordinate={job.coordinate} />
              )}
            </MapView>
          </View>
        ) : null}

        <View style={styles.card}>
          <Row label="Customer" value={job.customerName} />
          <Row label="Lawn size" value={formatSqft(job.squareFeet)} />
          <Row label="Est. duration" value={`${job.durationMinutes} min`} />
          <Row label="You earn" value={formatUsd(job.priceEstimate * 0.8)} bold />
        </View>

        {job.notes ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Customer notes</Text>
            <Text style={styles.notes}>{job.notes}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton
            label="Pass"
            variant="outline"
            onPress={onDecline}
            style={{ flex: 1 }}
          />
          <PrimaryButton
            label="Accept job"
            onPress={onAccept}
            style={{ flex: 1.4 }}
          />
        </View>
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
  subtitle: { color: colors.primary, fontWeight: '700', marginBottom: spacing.md },
  mapWrap: {
    height: 200,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: '#000',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { color: colors.textMuted },
  rowValue: { color: colors.text, fontWeight: '600' },
  sectionTitle: { fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  notes: { color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
