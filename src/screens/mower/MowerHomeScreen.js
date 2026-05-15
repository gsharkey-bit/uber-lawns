import React from 'react';
import { View, Text, StyleSheet, Switch, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import RatingStars from '../../components/RatingStars';
import JobCard from '../../components/JobCard';
import { colors, radii, spacing } from '../../theme/colors';

export default function MowerHomeScreen({ navigation }) {
  const { user, setOnline } = useAuth();
  const { openJobsForTier, jobsForMower } = useJobs();

  const offers = user.online ? openJobsForTier(user.tiers) : [];
  const active = jobsForMower(user.id).find((j) =>
    ['accepted', 'in_progress'].includes(j.status)
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>{user.name}</Text>
            <RatingStars value={user.rating} size={16} />
            <Text style={styles.meta}>{user.jobsCompleted} jobs completed</Text>
          </View>
          <View style={styles.onlineWrap}>
            <Text style={styles.onlineLabel}>{user.online ? 'Online' : 'Offline'}</Text>
            <Switch
              value={!!user.online}
              onValueChange={setOnline}
              trackColor={{ false: '#CFD8CF', true: colors.primaryLight }}
              thumbColor={user.online ? colors.primary : '#fff'}
            />
          </View>
        </View>

        {active ? (
          <>
            <Text style={styles.sectionTitle}>Active job</Text>
            <JobCard
              job={active}
              viewerRole="mower"
              onPress={() => navigation.navigate('ActiveJob', { jobId: active.id })}
              ctaLabel="Open job"
            />
          </>
        ) : null}

        <Text style={styles.sectionTitle}>
          {user.online ? 'Available nearby' : 'You\'re offline'}
        </Text>

        {!user.online ? (
          <View style={styles.offlineCard}>
            <Ionicons name="moon" size={28} color={colors.textMuted} />
            <Text style={styles.offlineText}>
              Flip the switch above to start receiving job offers.
            </Text>
          </View>
        ) : offers.length === 0 ? (
          <Text style={styles.empty}>No jobs nearby right now. Check back soon.</Text>
        ) : (
          offers.map((j) => (
            <JobCard
              key={j.id}
              job={j}
              viewerRole="mower"
              onPress={() => navigation.navigate('JobDetails', { jobId: j.id })}
              ctaLabel="See details"
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
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hello: { fontWeight: '800', fontSize: 18, color: colors.text },
  meta: { color: colors.textMuted, marginTop: 2, fontSize: 12 },
  onlineWrap: { alignItems: 'center', gap: 4 },
  onlineLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  sectionTitle: {
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  empty: { color: colors.textMuted, fontStyle: 'italic' },
  offlineCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm,
  },
  offlineText: { color: colors.textMuted, textAlign: 'center' },
});
