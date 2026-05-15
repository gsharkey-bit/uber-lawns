import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useJobs } from '../../context/JobsContext';
import PrimaryButton from '../../components/PrimaryButton';
import { formatUsd } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

const PRESETS = [15, 20, 25];

export default function TipPickerScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { jobs, addTip } = useJobs();
  const job = jobs.find((j) => j.id === jobId);
  const [picked, setPicked] = useState(20);

  if (!job) return null;

  const tipAmount = Math.round(job.priceEstimate * (picked / 100) * 100) / 100;

  const submit = (amount) => {
    addTip(jobId, amount);
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Want to add a tip?</Text>
        <Text style={styles.subtitle}>
          100% of your tip goes to {job.mowerName}. No platform cut.
        </Text>

        <View style={styles.row}>
          {PRESETS.map((p) => {
            const sel = picked === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.tip, sel && styles.tipSelected]}
                onPress={() => setPicked(p)}
                activeOpacity={0.85}
              >
                <Text style={styles.tipPct}>{p}%</Text>
                <Text style={styles.tipAmt}>
                  {formatUsd(Math.round(job.priceEstimate * (p / 100) * 100) / 100)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
          <PrimaryButton label="No tip" variant="outline" onPress={() => submit(0)} style={{ flex: 1 }} />
          <PrimaryButton label={`Add ${formatUsd(tipAmount)}`} onPress={() => submit(tipAmount)} style={{ flex: 1.6 }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.sm },
  tip: {
    flex: 1, paddingVertical: 14, borderRadius: radii.md,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
    alignItems: 'center',
  },
  tipSelected: { borderColor: colors.primary, backgroundColor: '#EFF7EF' },
  tipPct: { fontWeight: '700', color: colors.text, fontSize: 16 },
  tipAmt: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
