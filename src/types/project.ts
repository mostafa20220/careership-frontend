export interface TaskEndpoint {
  id?: number;
  method: string;
  path?: string;
  url?: string;
  description?: string;
}

export interface Task {
  id: number;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  is_passed: boolean;
  duration_in_days: number;
  tests?: string[];
  difficulty_level: number | string | null;
  created_at: string;
  updated_at?: string;
  endpoints?: TaskEndpoint[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
  slug: string;
  is_premium: boolean;
  is_public: boolean;
  created_at: string;
  max_team_size: number;
  difficulty_level: string;
  category: string;
  tasks: Task[];
  is_registered: boolean;
  created_by_name: string;
}

export interface ProjectsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Project[];
}

export interface Category {
  id: number;
  name: string;
}

export interface Difficulty {
  id: number;
  name: string;
}

export interface ProjectRegistration {
  id: number;
  project: {
    id: number;
    name: string;
  };
  team: string;
  deployment_url: string;
  created_at: string;
}

export interface ProjectRegistrationDetail {
  id: number;
  project: {
    id: number;
    name: string;
    description: string;
    slug: string;
    is_premium: boolean;
    is_public: boolean;
    created_at: string;
    max_team_size: number;
    difficulty_level: string;
    category: string;
    is_registered: boolean;
    created_by_name: string;
  };
  team: {
    uuid: string;
    name: string;
  };
  is_finished: boolean;
  finished_at: string | null;
  created_at: string;
  updated_at?: string;
  deployment_url: string;
}
