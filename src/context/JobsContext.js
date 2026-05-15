import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { mockSeedJobs } from '../data/mockData';

const JobsContext = createContext(null);

let jobCounter = 1000;
function nextJobId() { jobCounter += 1; return `j_${jobCounter}`; }

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState(mockSeedJobs);

  const createJob = useCallback((payload) => {
    const job = {
      id: nextJobId(),
      status: 'open',
      createdAt: Date.now(),
      tip: 0,
      chatMessages: [],
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
      status: 'confirming',
      mowerId: mower.id,
      mowerName: mower.name,
      mowerRating: mower.rating,
      acceptedAt: Date.now(),
    });
  }, [updateJob]);

  const confirmOutline = useCallback((jobId) => {
    updateJob(jobId, { status: 'accepted', outlineConfirmedAt: Date.now() });
  }, [updateJob]);

  const startJob = useCallback((jobId) => {
    updateJob(jobId, { status: 'in_progress', startedAt: Date.now() });
  }, [updateJob]);

  const completeJob = useCallback((jobId) => {
    updateJob(jobId, { status: 'completed', completedAt: Date.now() });
  }, [updateJob]);

  const rateJob = useCallback((jobId, rating) => {
    updateJob(jobId, { status: 'rated', rating });
  }, [updateJob]);

  const addTip = useCallback((jobId, amount) => {
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, tip: amount, status: 'tipped' } : j));
  }, []);

  const cancelJob = useCallback((jobId) => {
    updateJob(jobId, { status: 'cancelled', cancelledAt: Date.now() });
  }, [updateJob]);

  const sendChatMessage = useCallback((jobId, from, text) => {
    setJobs((prev) => prev.map((j) => {
      if (j.id !== jobId) return j;
      const msgs = j.chatMessages || [];
      return { ...j, chatMessages: [...msgs, { from, text, ts: Date.now() }] };
    }));
  }, []);

  const jobsForCustomer = useCallback((customerId) =>
    jobs.filter((j) => j.customerId === customerId), [jobs]);

  const openJobsForTier = useCallback((allowedTiers) =>
    jobs.filter((j) => j.status === 'open' && allowedTiers.includes(j.tier)), [jobs]);

  const jobsForMower = useCallback((mowerId) =>
    jobs.filter((j) => j.mowerId === mowerId), [jobs]);

  const value = useMemo(() => ({
    jobs, createJob, updateJob, acceptJob, confirmOutline, startJob, completeJob,
    rateJob, addTip, cancelJob, sendChatMessage,
    jobsForCustomer, openJobsForTier, jobsForMower,
  }), [jobs, createJob, updateJob, acceptJob, confirmOutline, startJob, completeJob,
       rateJob, addTip, cancelJob, sendChatMessage, jobsForCustomer, openJobsForTier, jobsForMower]);

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used inside JobsProvider');
  return ctx;
}
