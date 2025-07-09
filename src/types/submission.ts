export interface Submission {
  id: number;
  task: number; // task order, not task ID
  user: string; // user name instead of ID
  team: string; // team name instead of ID
  status: string;
  passed_tests: number;
  failed_test_index: number | null;
  passed_percentage: string; // changed to string to match API
  deployment_url?: string;
  github_url?: string;
  completed_at?: string | null;
  created_at: string;
}

export interface ExecutionLog {
  name: string;
  passed: boolean;
  task_id: number;
  feedback: string;
  task_name: string;
  test_case_id: number;
  points_earned: number;
}

export interface SubmissionDetail {
  id: number;
  status: string;
  passed_tests: number;
  failed_test_index: number | null;
  passed_percentage: string;
  execution_logs: ExecutionLog[];
  feedback?: string | null;
  deployment_url?: string;
  github_url?: string;
  completed_at?: string | null;
  created_at: string;
  project: number;
  task: number; // actual task ID for details
  user: number; // user ID for details
  team: number; // team ID for details
}
