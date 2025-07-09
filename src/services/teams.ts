import api from "./api";
import type { Team } from "../types/team";

export interface CreateTeamRequest {
  name: string;
}

// Teams API
export const fetchTeams = () => api.get<Team[]>("/teams/");
export const fetchTeam = (uuid: string) => api.get<Team>(`/teams/${uuid}/`);
export const createTeam = (data: CreateTeamRequest) =>
  api.post<Team>("/teams/", data);
export const updateTeam = (teamId: string, data: { name?: string; owner?: string }) => {
  return api.patch(`/teams/${teamId}/`, data);
};
export const deleteTeam = (uuid: string) => api.delete(`/teams/${uuid}/`);
export const leaveTeam = (uuid: string) => api.post(`/teams/${uuid}/leave/`);
export const addMember = (uuid: string, email: string) =>
  api.post(`/teams/${uuid}/members/`, { email });
export const removeMember = (uuid: string, email: string) =>
  api.delete(`/teams/${uuid}/members/`, { data: { email } });
export const removeTeamMember = (teamId: string, email: string) => {
  return api.delete(`/teams/${teamId}/members/`, { data: { email } });
};

// Invitations API
export const fetchInvitations = (teamUuid: string) =>
  api.get(`/teams/${teamUuid}/invitations/`);
export const fetchInvitation = (teamUuid: string, invitationUuid: string) =>
  api.get(`/teams/${teamUuid}/invitations/${invitationUuid}/`);
export const createInvitation = (teamUuid: string, data: any) =>
  api.post(`/teams/${teamUuid}/invitations/`, data);
export const acceptInvitation = (teamUuid: string, invitationUuid: string) =>
  api.post(`/teams/${teamUuid}/invitations/${invitationUuid}/accept/`);
export const enableInvitation = (teamUuid: string, invitationUuid: string) =>
  api.post(`/teams/${teamUuid}/invitations/${invitationUuid}/enable/`);
export const disableInvitation = (teamUuid: string, invitationUuid: string) =>
  api.post(`/teams/${teamUuid}/invitations/${invitationUuid}/disable/`);
export const deleteInvitation = (teamUuid: string, invitationUuid: string) =>
  api.delete(`/teams/${teamUuid}/invitations/${invitationUuid}/`);


// team registeration
export const registerTeamToProject = (data: {
  project: number;
  team: string;
  deployment_url?: string;
}) => api.post("/projects/registrations/", data);

export const fetchProjectRegistrations = (projectId: number) =>
  api.get(`/projects/registrations/`);
