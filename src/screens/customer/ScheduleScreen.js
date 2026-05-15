import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { FREQUENCIES, isSurgeDay } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

/**
 * ScheduleScreen — pick a time slot and a recurrence frequency.
 */
export default function ScheduleScreen({ route, navigation }) {
  const params = route.params;
  const [picked, setPicked] = useState(null);
  const [frequency, setFrequency] = useState('once');

  const slots = useMemo(() => buildSlots(), []);

  const onContinue = () => {
    if (!picked) return;
    navigation.navigate('RequestJob', {
      ...params,
      schedule: picked,
      frequency,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>When should we mow?</Text>
        <Text style={styles.subtitle}>
          Thursday and Friday slots are slightly more expensive — most customers want a fresh cut before the weekend.
        </Text>

        <View style={styles.grid}>
          {slots.map((s, i) => {
            const selected = picked && picked.label === s.label;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.slot, selected && styles.slotSelected]}
                onPress={() => setPicked(s)}
                activeOpacity={0.85}
              >
                <Text style={styles.slotDay}>{s.dayLabel}</Text>
                <Text style={styles.slotTime}>{s.slot}</Text>
                {isSurgeDay(s.day) ? (
                  <View style={styles.surgeBadge}>
                    <Text style={styles.surgeBadgeText}>Surge ×1.2</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>How often?</Text>
        <View style={styles.freqRow}>
          {Object.values(FREQUENCIES).map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.freqCard, frequency === f.id && styles.freqCardSelected]}
              onPress={() => setFrequency(f.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.freqLabel}>{f.label}</Text>
              {f.discount ? (
                <Text style={styles.freqDisc}>Save {Math.round(f.discount * 100)}%</Text>
              ) : <Text style={styles.freqDisc}> </Text>}
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          label="Continue"
          disabled={!picked}
          onPress={onContinue}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function buildSlots() {
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const slotTimes = ['8–11 am','11 am–2 pm','2–5 pm','5–8 pm'];
  const today = new Date();
  const out = [{ label: 'ASAP', dayLabel: 'ASAP', slot: 'Within 1 hour', day: today.getDay() }];
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dn = d.getDay();
    const dl = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[dn];
    for (const slot of slotTimes) {
      out.push({ label: `${dl}, ${slot}`, dayLabel: dl, slot, day: dn });
    }
  }
  return out.slice(0, 13);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slot: {
    width: '48%', backgroundColor: colors.surface, borderRadius: radii.md,
    padding: spacing.md, borderWidth: 1.5, borderColor: colors.border,
  },
  slotSelected: { borderColor: colors.primary, backgroundColor: '#EFF7EF' },
  slotDay: { fontWeight: '700', color: colors.text, fontSize: 14 },
  slotTime: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  surgeBadge: { alignSelf: 'flex-start', marginTop: 6, backgroundColor: '#FFE0B2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill },
  surgeBadgeText: { color: '#BF360C', fontSize: 10, fontWeight: '700' },
  sectionTitle: { fontWeight: '800', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  freqRow: { flexDirection: 'row', gap: spacing.sm },
  freqCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.md,
    padding: spacing.sm, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  freqCardSelected: { borderColor: colors.primary, backgroundColor: '#EFF7EF' },
  freqLabel: { fontWeight: '600', color: colors.text, fontSize: 12, textAlign: 'center' },
  freqDisc: { color: colors.primary, fontSize: 11, fontWeight: '700', marginTop: 2, textAlign: 'center' },
});
