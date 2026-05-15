import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useJobs } from '../../context/JobsContext';
import PrimaryButton from '../../components/PrimaryButton';
import { formatSqft } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

export default function ConfirmOutlineScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { jobs, confirmOutline, sendChatMessage } = useJobs();
  const job = jobs.find((j) => j.id === jobId);

  if (!job) return null;

  const region = job.coordinate
    ? { ...job.coordinate, latitudeDelta: 0.001, longitudeDelta: 0.001 }
    : null;

  const onConfirm = () => {
    confirmOutline(jobId);
    navigation.replace('ActiveJob', { jobId });
  };

  const onFlag = () => {
    Alert.alert(
      'Flag this outline?',
      'The customer will be notified and you can chat about it before starting.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Flag',
          style: 'destructive',
          onPress: () => {
            sendChatMessage(jobId, 'mower', "Hey, the lawn looks bigger than what's outlined. Mind taking a look?");
            navigation.replace('Chat', { jobId });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Does this outline look right?</Text>
        <Text style={styles.sub}>
          {job.addressLabel} · {formatSqft(job.squareFeet)}
          {job.measurementSource === 'auto' ? ' (auto)' : ' (customer drawn)'}
        </Text>
      </View>

      <View style={styles.mapWrap}>
        {region ? (
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={region}
            mapType="satellite"
          >
            {job.polygon && job.polygon.length >= 3 ? (
              <Polygon
                coordinates={job.polygon}
                strokeColor={colors.primary}
                fillColor="rgba(46,125,50,0.35)"
                strokeWidth={2}
              />
            ) : null}
          </MapView>
        ) : null}
      </View>

      <View style={styles.notice}>
        <Ionicons name="information-circle" size={18} color="#B27500" />
        <Text style={styles.noticeText}>
          Tap "Looks good" to start the timer. Flag the outline if the lawn is bigger, smaller, or has obstacles the customer missed.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Flag outline" variant="outline" onPress={onFlag} style={{ flex: 1 }} />
        <PrimaryButton label="Looks good" onPress={onConfirm} style={{ flex: 1.4 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  sub: { color: colors.textMuted, marginTop: 4 },
  mapWrap: { flex: 1, marginHorizontal: spacing.lg, borderRadius: radii.md, overflow: 'hidden', backgroundColor: '#000' },
  notice: {
    flexDirection: 'row', gap: 8, padding: spacing.md, margin: spacing.lg,
    backgroundColor: '#FFF8E1', borderRadius: radii.md, borderWidth: 1, borderColor: '#FFE082',
    alignItems: 'flex-start',
  },
  noticeText: { color: '#B27500', flex: 1, fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
});
