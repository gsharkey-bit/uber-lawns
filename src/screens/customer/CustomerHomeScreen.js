import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import JobCard from '../../components/JobCard';
import { colors, radii, spacing } from '../../theme/colors';

export default function CustomerHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { jobsForCustomer } = useJobs();
  const myJobs = jobsForCustomer(user.id);
  const active = myJobs.find((j) =>
    ['open', 'accepted', 'in_progress', 'completed'].includes(j.status)
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.hello}>Hi {user.name.split(' ')[0]} 👋</Text>
        <Text style={styles.title}>Ready for a fresh cut?</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <Ionicons name="leaf" size={32} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Request a mow</Text>
              <Text style={styles.heroSub}>
                Outline your lawn on the map and we'll find a mower nearby.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('LawnMeasure')}
            activeOpacity={0.85}
            style={styles.heroCta}
          >
            <Text style={styles.heroCtaLabel}>Outline my lawn</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>

        {active ? (
          <>
            <Text style={styles.sectionTitle}>Current job</Text>
            <JobCard
              job={active}
              onPress={() => navigation.navigate('JobStatus', { jobId: active.id })}
              ctaLabel="View status"
            />
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Recent jobs</Text>
        {myJobs.length === 0 ? (
          <Text style={styles.empty}>
            No jobs yet — your history will show up here.
          </Text>
        ) : (
          myJobs
            .filter((j) => j.id !== active?.id)
            .map((j) => (
              <JobCard
                key={j.id}
                job={j}
                onPress={() => navigation.navigate('JobStatus', { jobId: j.id })}
              />
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  hello: { color: colors.textMuted, fontSize: 14 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  heroCard: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radii.lg,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroSub: { color: '#E8F5E9', marginTop: 2 },
  heroCta: {
    marginTop: spacing.md,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroCtaLabel: { color: colors.primaryDark, fontWeight: '800', fontSize: 16 },
  sectionTitle: {
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  empty: { color: colors.textMuted, fontStyle: 'italic' },
});
