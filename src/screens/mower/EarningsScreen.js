import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import JobCard from '../../components/JobCard';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import { formatUsd } from '../../utils/pricing';
import { colors, radii, spacing } from '../../theme/colors';

export default function EarningsScreen({ navigation }) {
  const { user } = useAuth();
  const { jobsForMower } = useJobs();

  const myJobs = jobsForMower(user.id);

  const stats = useMemo(() => {
    const completed = myJobs.filter((j) => ['completed', 'rated'].includes(j.status));
    const totalEarnings = completed.reduce(
      (sum, j) => sum + j.priceEstimate * 0.8,
      0
    );
    const today = completed.filter(
      (j) => Date.now() - (j.completedAt || j.createdAt) < 24 * 60 * 60 * 1000
    );
    const todayEarnings = today.reduce((sum, j) => sum + j.priceEstimate * 0.8, 0);
    return {
      totalEarnings,
      todayEarnings,
      jobsTotal: completed.length,
      jobsToday: today.length,
    };
  }, [myJobs]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Earnings</Text>

        <View style={styles.statRow}>
          <Stat label="Today" amount={stats.todayEarnings} count={stats.jobsToday} />
          <Stat label="All time" amount={stats.totalEarnings} count={stats.jobsTotal} />
        </View>

        <Text style={styles.sectionTitle}>Recent jobs</Text>
        {myJobs.length === 0 ? (
          <Text style={styles.empty}>You haven't accepted any jobs yet.</Text>
        ) : (
          myJobs
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((j) => (
              <JobCard
                key={j.id}
                job={j}
                onPress={() => navigation.navigate('ActiveJob', { jobId: j.id })}
              />
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, amount, count }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statAmount}>{formatUsd(amount)}</Text>
      <Text style={styles.statCount}>{count} job{count === 1 ? '' : 's'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  statAmount: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 },
  statCount: { color: colors.textMuted, marginTop: 2 },
  sectionTitle: {
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  empty: { color: colors.textMuted, fontStyle: 'italic' },
});
