import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import PriceTierSelector from '../../components/PriceTierSelector';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import {
  estimatePrice,
  estimateDurationMinutes,
  formatSqft,
  formatUsd,
} from '../../utils/pricing';
import { polygonCentroid } from '../../utils/geometry';
import { colors, radii, spacing } from '../../theme/colors';

export default function RequestJobScreen({ route, navigation }) {
  const { squareFeet, coordinates } = route.params;
  const { user } = useAuth();
  const { createJob } = useJobs();
  const [tier, setTier] = useState('standard');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState(user.addressLabel || '');

  const price = estimatePrice(squareFeet, tier);
  const duration = estimateDurationMinutes(squareFeet);
  const centroid = polygonCentroid(coordinates);

  const onConfirm = () => {
    const job = createJob({
      customerId: user.id,
      customerName: user.name,
      addressLabel: address || 'My lawn',
      coordinate: centroid,
      polygon: coordinates,
      squareFeet,
      tier,
      priceEstimate: price,
      durationMinutes: duration,
      notes,
    });
    navigation.replace('JobStatus', { jobId: job.id });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Confirm your job</Text>

        <View style={styles.summary}>
          <SummaryRow label="Lawn size" value={formatSqft(squareFeet)} />
          <SummaryRow label="Est. duration" value={`${duration} min`} />
          <SummaryRow label="Price" value={formatUsd(price)} bold />
        </View>

        <Text style={styles.sectionTitle}>Choose a tier</Text>
        <PriceTierSelector
          squareFeet={squareFeet}
          value={tier}
          onChange={setTier}
        />

        <Text style={styles.sectionTitle}>Address (shown to mower)</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="123 Maple Street"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.sectionTitle}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, { height: 88 }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Gate code, dog in yard, please bag clippings, etc."
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <PrimaryButton
          label={`Request mow • ${formatUsd(price)}`}
          onPress={onConfirm}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, bold }) {
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
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: { color: colors.textMuted },
  rowValue: { color: colors.text, fontWeight: '600' },
  sectionTitle: {
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
  },
});
