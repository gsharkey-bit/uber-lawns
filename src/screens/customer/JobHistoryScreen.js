import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import JobCard from '../../components/JobCard';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import { colors, spacing } from '../../theme/colors';

export default function JobHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const { jobsForCustomer } = useJobs();
  const items = jobsForCustomer(user.id).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your jobs</Text>
        {items.length === 0 ? (
          <Text style={styles.empty}>You haven't requested a mow yet.</Text>
        ) : (
          items.map((j) => (
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
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  empty: { color: colors.textMuted, fontStyle: 'italic' },
});
