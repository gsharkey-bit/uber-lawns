import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { mockSeedJobs } from '../data/mockData';

/**
 * JobsContext: in-memory job board shared between the customer and mower
 * apps. A real backend would push these via WebSocket / FCM.
 *
 * Job lifecycle:
 *   open -> accepted -> in_progress -> completed -> rated
 *   open -> cancelled
 */
const JobsContext = createContext(null);

let jobCounter = 1000;
function nextJobId() {
  jobCounter += 1;
  return `j_${jobCounter}`;
}

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState(mockSeedJobs);

  const createJob = useCallback((payload) => {
    const job = {
      id: nextJobId(),
      status: 'open',
      createdAt: Date.now(),
      ...payload,
    };
    setJobs((prev) => [job, ...prev]);
    return job;
  }, []);

  const updateJob = useCallback((id, patch) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  const acceptJob = useCallback((jobId, mower) => {
    updateJob(jobId, {
      status: 'accepted',
      mowerId: mower.id,
      mowerName: mower.name,
      mowerRating: mower.rating,
      acceptedAt: Date.now(),
    });
  }, [updateJob]);

  const startJob = useCallback((jobId) => {
    updateJob(jobId, { status: 'in_progress', startedAt: Date.now() });
  }, [updateJob]);

  const completeJob = useCallback((jobId) => {
    updateJob(jobId, { status: 'completed', completedAt: Date.now() });
  }, [updateJob]);

  const rateJob = useCallback((jobId, rating, comment) => {
    updateJob(jobId, { status: 'rated', rating, ratingComment: comment });
  }, [updateJob]);

  const cancelJob = useCallback((jobId) => {
    updateJob(jobId, { status: 'cancelled', cancelledAt: Date.now() });
  }, [updateJob]);

  const jobsForCustomer = useCallback(
    (customerId) => jobs.filter((j) => j.customerId === customerId),
    [jobs]
  );

  const openJobsForTier = useCallback(
    (allowedTiers) =>
      jobs.filter((j) => j.status === 'open' && allowedTiers.includes(j.tier)),
    [jobs]
  );

  const jobsForMower = useCallback(
    (mowerId) => jobs.filter((j) => j.mowerId === mowerId),
    [jobs]
  );

  const value = useMemo(
    () => ({
      jobs,
      createJob,
      updateJob,
      acceptJob,
      startJob,
      completeJob,
      rateJob,
      cancelJob,
      jobsForCustomer,
      openJobsForTier,
      jobsForMower,
    }),
    [
      jobs,
      createJob,
      updateJob,
      acceptJob,
      startJob,
      completeJob,
      rateJob,
      cancelJob,
      jobsForCustomer,
      openJobsForTier,
      jobsForMower,
    ]
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used inside JobsProvider');
  return ctx;
}
