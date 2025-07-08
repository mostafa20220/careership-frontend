import api from "./api";

export interface ProjectDraft {
  id: number;
  name: string | null;
  status: "generating" | "pending_review" | "completed" | "archived";
  is_public: boolean;
  category: string; // Changed from number to string based on API response
  difficulty_level: string; // Changed from number to string based on API response
  latest_project_json: Record<string, any>;
  conversation_history: any[];
  created_at: string;
}

export interface CreateProjectDraftRequest {
  name?: string;
  category_id: number;
  difficulty_level_id: number;
  is_public: boolean;
}

export interface RefineProjectDraftRequest {
  prompt: string;
}

export interface RefineProjectDraftResponse {
  // Empty response body for 200 OK
}

// List all project drafts (GET - with trailing slash)
export const listProjectDrafts = (filters?: {
  name?: string;
  category?: number;
  difficulty_level?: number;
  is_public?: boolean;
}) => {
  return api.get<ProjectDraft[]>("/projects/drafts/", { params: filters });
};

// Create a new project draft (POST - with trailing slash)
export const createProjectDraft = (data: CreateProjectDraftRequest) => {
  return api.post<ProjectDraft>("/projects/drafts/", data);
};

// Get a specific project draft (GET - with trailing slash)
export const getProjectDraft = (draftId: number) => {
  return api.get<ProjectDraft>(`/projects/drafts/${draftId}/`);
};

// Refine an existing project draft (POST - with trailing slash)
export const refineProjectDraft = (
  draftId: number,
  data: RefineProjectDraftRequest
) => {
  return api.post<RefineProjectDraftResponse>(
    `/projects/drafts/${draftId}/refine/`,
    data
  );
};

// Finalize a project draft (POST - with trailing slash)
export const finalizeProjectDraft = (draftId: number, isPublic?: boolean) => {
  return api.post<{ id: number; name: string; slug: string; message: string }>(
    `/projects/drafts/${draftId}/finalize/`,
    isPublic !== undefined ? { is_public: isPublic } : undefined
  );
};

// Update project draft details (PATCH - with trailing slash)
export const updateProjectDraft = (
  draftId: number,
  data: Partial<{ name: string; is_public: boolean }>
) => {
  return api.patch<ProjectDraft>(`/projects/drafts/${draftId}/`, data);
};

// Delete a project draft (DELETE - with trailing slash)
export const deleteProjectDraft = (draftId: number) => {
  return api.delete(`/projects/drafts/${draftId}/`);
};
