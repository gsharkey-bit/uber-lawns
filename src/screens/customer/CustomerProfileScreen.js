import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { formatUsd } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

export default function CustomerProfileScreen() {
  const { user, signOut } = useAuth();

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Try Uber Lawns! Use my code ${user.referralCode} and we both get $10 off.`,
      });
    } catch {
      Alert.alert('Share failed', 'Try copying the code instead.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.card}>
          <Row label="Default address" value={user.addressLabel || '—'} />
          <Row label="Account type" value="Customer" />
        </View>

        <View style={styles.card}>
          <View style={styles.referralHeader}>
            <Ionicons name="gift" size={22} color={colors.primary} />
            <Text style={styles.referralTitle}>Refer a neighbor</Text>
          </View>
          <Text style={styles.referralSub}>
            Both of you get $10 off when they book. Mowers love batched neighborhood jobs.
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{user.referralCode}</Text>
          </View>
          <View style={styles.referralActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={shareCode}>
              <Ionicons name="share-outline" size={18} color={colors.primary} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Copied', user.referralCode)}>
              <Ionicons name="copy-outline" size={18} color={colors.primary} />
              <Text style={styles.actionText}>Copy</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Neighbors joined</Text>
              <Text style={styles.statVal}>{user.referralsCount || 0}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Credit earned</Text>
              <Text style={[styles.statVal, { color: colors.primary }]}>{formatUsd(user.referralEarnings || 0)}</Text>
            </View>
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
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, alignItems: 'center' },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  name: { fontSize: 22, fontWeight: '800', marginTop: spacing.md, color: colors.text },
  email: { color: colors.textMuted, marginTop: 2 },
  card: { width: '100%', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { color: colors.textMuted },
  rowValue: { color: colors.text, fontWeight: '600' },
  referralHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  referralTitle: { fontWeight: '700', color: colors.text, fontSize: 15 },
  referralSub: { color: colors.textMuted, fontSize: 13, marginBottom: 10 },
  codeBox: { padding: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primary, borderRadius: radii.md, backgroundColor: '#EFF7EF', alignItems: 'center' },
  codeText: { fontFamily: 'Courier', fontSize: 16, fontWeight: '700', color: colors.primaryDark, letterSpacing: 1 },
  referralActions: { flexDirection: 'row', gap: spacing.sm, marginTop: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderWidth: 1, borderColor: colors.primary, borderRadius: 999 },
  actionText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  stat: { flex: 1, backgroundColor: '#F7F9F7', padding: 10, borderRadius: radii.sm },
  statLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  statVal: { fontSize: 18, fontWeight: '800', marginTop: 2 },
});
