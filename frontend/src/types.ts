export type JobStatus = "Applied" | "Online Assessment" | "Interview" | "Offer" | "Rejected";
export interface Job {
  _id: string;
  company: string;
  role: string;
  status: JobStatus;
  location?: string;
  dateApplied?: string;
  interviewDate?: string;
  updatedAt: string;
}
