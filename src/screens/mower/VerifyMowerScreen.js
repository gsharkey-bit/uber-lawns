import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { colors, radii, spacing } from '../../theme/colors';

const STEPS = [
  { key: 'id', icon: 'card', title: 'Upload photo ID', sub: "Driver's license or passport" },
  { key: 'selfie', icon: 'camera', title: 'Take a selfie', sub: 'We match it to your ID' },
  { key: 'insurance', icon: 'shield-checkmark', title: 'Add liability insurance', sub: 'Or buy our $5/mo policy' },
  { key: 'agree', icon: 'document-text', title: 'Sign mower agreement', sub: 'Terms, payouts, conduct' },
];

export default function VerifyMowerScreen() {
  const { setMowerVerified } = useAuth();
  const [done, setDone] = useState({});

  const allDone = STEPS.every((s) => done[s.key]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Get verified to start mowing</Text>
        <Text style={styles.subtitle}>
          All mowers must complete verification before accepting jobs. Most steps take under a minute.
        </Text>

        <View style={styles.card}>
          {STEPS.map((s) => (
            <View key={s.key} style={styles.step}>
              <Ionicons name={s.icon} size={22} color={done[s.key] ? colors.primary : colors.textMuted} style={{ width: 28 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepSub}>{s.sub}</Text>
              </View>
              <TouchableOpacity
                style={[styles.btn, done[s.key] && styles.btnDone]}
                onPress={() => setDone((d) => ({ ...d, [s.key]: true }))}
              >
                <Text style={[styles.btnText, done[s.key] && { color: colors.primary }]}>
                  {done[s.key] ? 'Done' : 'Start'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <PrimaryButton
          label={allDone ? 'Submit for review' : `Complete ${STEPS.filter((s) => !done[s.key]).length} more`}
          disabled={!allDone}
          onPress={() => setMowerVerified(true)}
        />
        <Text style={styles.hint}>
          Review typically takes 1–2 business days. (Instant in this demo.)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F2F0' },
  stepTitle: { fontWeight: '600', color: colors.text, fontSize: 14 },
  stepSub: { color: colors.textMuted, fontSize: 12 },
  btn: { backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999 },
  btnDone: { backgroundColor: '#EFF7EF' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  hint: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 10 },
});
