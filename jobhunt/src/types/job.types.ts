export type JobStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface Job {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  tags: string[];
  appliedDate: string; // ISO date string
  interviewDate?: string; // ISO date string, optional
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Used by InterviewListItem's tag pills to vary color per tag position. */
export type TagCategory = 'neutral' | 'primary' | 'accent';