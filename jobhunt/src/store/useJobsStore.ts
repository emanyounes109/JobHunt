import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Job, JobStatus } from '../types/job.types';
import { perUserStorage } from './persistPerUser';

interface JobsState {
  jobs: Job[];
}

interface JobsActions {
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateStatus: (id: string, status: JobStatus) => void;
  getJobById: (id: string) => Job | undefined;
  getJobsByStatus: (status: JobStatus) => Job[];
}

export type JobsStore = JobsState & JobsActions;

const nowIso = (): string => new Date().toISOString();

export const useJobsStore = create<JobsStore>()(
  persist(
    (set, get) => ({
      // Every new account starts with zero jobs — nothing is seeded here.
      // Each signed-in user's jobs live under their own localStorage key
      // (see persistPerUser.ts), so switching accounts never shows
      // another account's data.
      jobs: [],

      addJob: (job) => {
        const timestamp = nowIso();
        const newJob: Job = {
          ...job,
          id: uuidv4(),
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        set((state) => ({ jobs: [...state.jobs, newJob] }));
      },

      updateJob: (id, updates) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, ...updates, updatedAt: nowIso() } : job,
          ),
        }));
      },

      deleteJob: (id) => {
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
        }));
      },

      updateStatus: (id, status) => {
        get().updateJob(id, { status });
      },

      getJobById: (id) => {
        return get().jobs.find((job) => job.id === id);
      },

      getJobsByStatus: (status) => {
        return get().jobs.filter((job) => job.status === status);
      },
    }),
    {
      name: 'jhc-jobs',
      storage: createJSONStorage(() => perUserStorage),
    },
  ),
);