import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Job, JobStatus } from '../types/job.types';

const STORAGE_KEY = 'jhc-jobs-by-user';

interface JobsState {
  jobs: Job[];
  currentUserId: string | null;
}

interface JobsActions {
  loadForUser: (userId: string | null) => void;
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateStatus: (id: string, status: JobStatus) => void;
  getJobById: (id: string) => Job | undefined;
  getJobsByStatus: (status: JobStatus) => Job[];
}

export type JobsStore = JobsState & JobsActions;

const nowIso = (): string => new Date().toISOString();

/** Reads the entire { [userId]: Job[] } map from localStorage, synchronously. */
function readAllUsersJobs(): Record<string, Job[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** Writes the entire { [userId]: Job[] } map back to localStorage, synchronously. */
function writeAllUsersJobs(map: Record<string, Job[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage unavailable/full — fail silently, in-memory state still works
  }
}

/** Persists the CURRENT store's jobs array under the CURRENT user's slot. */
function persistCurrentUserJobs(userId: string | null, jobs: Job[]): void {
  if (!userId) return; // guests/no-user: never touch shared storage
  const all = readAllUsersJobs();
  all[userId] = jobs;
  writeAllUsersJobs(all);
}

export const useJobsStore = create<JobsStore>((set, get) => ({
  jobs: [],
  currentUserId: null,

  /**
   * Called synchronously whenever the signed-in user changes (login,
   * signup, logout). Reads that exact user's job array directly out of
   * the single storage blob — no async rehydration, no race condition.
   * A user with no entry yet (brand-new account) simply gets `[]`.
   */
  loadForUser: (userId) => {
    if (!userId) {
      set({ jobs: [], currentUserId: null });
      return;
    }
    const all = readAllUsersJobs();
    set({ jobs: all[userId] ?? [], currentUserId: userId });
  },

  addJob: (job) => {
    const timestamp = nowIso();
    const newJob: Job = { ...job, id: uuidv4(), createdAt: timestamp, updatedAt: timestamp };
    set((state) => {
      const jobs = [...state.jobs, newJob];
      persistCurrentUserJobs(state.currentUserId, jobs);
      return { jobs };
    });
  },

  updateJob: (id, updates) => {
    set((state) => {
      const jobs = state.jobs.map((job) =>
        job.id === id ? { ...job, ...updates, updatedAt: nowIso() } : job,
      );
      persistCurrentUserJobs(state.currentUserId, jobs);
      return { jobs };
    });
  },

  deleteJob: (id) => {
    set((state) => {
      const jobs = state.jobs.filter((job) => job.id !== id);
      persistCurrentUserJobs(state.currentUserId, jobs);
      return { jobs };
    });
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
}));