import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
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
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <RatingStars value={user.rating} size={18} />
        <Text style={styles.email}>{user.email}</Text>

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
                  id === 'pro' && { borderColor: colors.accent },
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    id === 'black' && { color: colors.proPurple },
                    id === 'pro' && { color: colors.accent },
                  ]}
                >
                  {TIERS[id]?.label || id}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <PrimaryButton
          label="Sign out"
          variant="outline"
          onPress={signOut}
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, alignItems: 'center' },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  name: { fontSize: 22, fontWeight: '800', marginTop: spacing.md, color: colors.text },
  email: { color: colors.textMuted, marginTop: 2, marginBottom: spacing.sm },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: spacing.md },
  rowLabel: { color: colors.textMuted },
  rowValue: { color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  sectionTitle: { fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipLabel: { color: colors.primary, fontWeight: '700' },
});
