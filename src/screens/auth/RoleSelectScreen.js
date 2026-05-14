import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../../theme/colors';

export default function RoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="leaf" size={48} color={colors.primary} />
          <Text style={styles.title}>Uber Lawns</Text>
          <Text style={styles.subtitle}>
            On-demand lawn mowing. Pick how you want to get started.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.card, styles.customerCard]}
          onPress={() => navigation.navigate('Login', { role: 'customer' })}
          activeOpacity={0.85}
        >
          <Ionicons name="home" size={28} color={colors.primary} />
          <Text style={styles.cardTitle}>I want my lawn mowed</Text>
          <Text style={styles.cardSubtitle}>
            Outline your lawn, get an instant price, request a mower.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.mowerCard]}
          onPress={() => navigation.navigate('Login', { role: 'mower' })}
          activeOpacity={0.85}
        >
          <Ionicons name="construct" size={28} color={colors.proPurple} />
          <Text style={styles.cardTitle}>I want to mow lawns</Text>
          <Text style={styles.cardSubtitle}>
            See nearby jobs, accept the ones you want, get paid.
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontSize: 15,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  customerCard: { borderColor: colors.primaryLight },
  mowerCard: { borderColor: '#E1BEE7' },
  cardTitle: { fontSize: 18, fontWeight: '800', marginTop: spacing.sm, color: colors.text },
  cardSubtitle: { color: colors.textMuted, marginTop: spacing.xs },
});
