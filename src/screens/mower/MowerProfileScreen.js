import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from '../../components/RatingStars';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { TIERS } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

export default function MowerProfileScreen() {
  const { user, signOut } = useAuth();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <RatingStars value={user.rating} size={18} />
        <Text style={styles.email}>{user.email}</Text>
        {user.verified ? (
          <View style={styles.verifiedChip}>
            <Ionicons name="shield-checkmark" size={13} color={colors.primaryDark} />
            <Text style={styles.verifiedText}>Verified mower</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Row label="Jobs completed" value={String(user.jobsCompleted)} />
          <Row label="Account type" value="Mower" />
          <Row label="Bio" value={user.bio || '—'} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tiers you can serve</Text>
          <View style={styles.chipRow}>
            {user.tiers.map((id) => (
              <View
                key={id}
                style={[
                  styles.chip,
                  id === 'black' && { backgroundColor: '#F3E5F5', borderColor: colors.proPurple },
                  id === 'pro' && { borderColor: colors.accent, backgroundColor: '#FFF8E1' },
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    id === 'black' && { color: colors.proPurple },
                    id === 'pro' && { color: '#B27500' },
                  ]}
                >
                  {TIERS[id]?.label || id}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <PrimaryButton label="Sign out" variant="outline" onPress={signOut} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={3}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, alignItems: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  name: { fontSize: 22, fontWeight: '800', marginTop: spacing.md, color: colors.text },
  email: { color: colors.textMuted, marginTop: 2, marginBottom: 6 },
  verifiedChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#EFF7EF', borderWidth: 1, borderColor: '#A5D6A7' },
  verifiedText: { color: colors.primaryDark, fontWeight: '700', fontSize: 12 },
  card: { width: '100%', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  rowLabel: { color: colors.textMuted },
  rowValue: { color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  sectionTitle: { fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: '#EFF7EF' },
  chipLabel: { color: colors.primary, fontWeight: '700' },
});
