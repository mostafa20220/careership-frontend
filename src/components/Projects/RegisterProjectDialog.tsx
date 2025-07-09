import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import {
  fetchProjectRegistrations,
  registerTeamToProject,
} from "../../services/teams";
import type { Team } from "../../types/team";
import type { ProjectRegistration } from "../../types/project";
import { fetchTeams } from "../../services/teams";

interface RegisterProjectDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string | undefined;
  onRegisterSuccess?: () => void;
}

const RegisterProjectDialog = ({
  open,
  onClose,
  projectId,
  onRegisterSuccess,
}: RegisterProjectDialogProps) => {
  // const theme = useTheme();
  const [teams, setTeams] = useState<Team[]>([]);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerTeam, setRegisterTeam] = useState<string>("");
  const [registerDeploymentUrl, setRegisterDeploymentUrl] = useState("");
  const [registeredTeamUuids, setRegisteredTeamUuids] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;

    const loadTeamsAndRegistrations = async () => {
      try {
        const teamsRes = await fetchTeams();
        setTeams(teamsRes.data);

        const registrationsRes = await fetchProjectRegistrations();
        const projectRegistrations = registrationsRes.data.filter(
          (reg: ProjectRegistration) => reg.project.id === Number(projectId)
        );

        setRegisteredTeamUuids(
          projectRegistrations.map((reg: ProjectRegistration) => {
            const match = reg.team.match(/\(([0-9a-fA-F-]+)\)$/);
            return match ? match[1] : reg.team;
          })
        );
      } catch (error) {
        console.error("Error loading teams or registrations:", error);
        setRegisterError("Failed to load teams or registrations");
      }
    };

    loadTeamsAndRegistrations();

    // Reset form
    setRegisterTeam("");
    setRegisterDeploymentUrl("");
    setRegisterError(null);
    setRegisterSuccess(null);
  }, [open, projectId]);

  const handleRegister = async () => {
    setRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    try {
      await registerTeamToProject({
        project: Number(projectId),
        team: registerTeam,
        deployment_url: registerDeploymentUrl,
      });
      setRegisterSuccess("Team registered to project!");
      if (onRegisterSuccess) onRegisterSuccess();
      onClose();
    } catch (err: any) {
      setRegisterError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} closeAfterTransition={false}>
      <DialogTitle>Register Team to Project</DialogTitle>
      <DialogContent sx={{ minWidth: 350 }}>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="register-team-label">Team</InputLabel>
          <Select
            labelId="register-team-label"
            value={registerTeam}
            label="Team"
            onChange={(e) => setRegisterTeam(e.target.value)}
            disabled={registering}
          >
            {teams
              .filter((team) => !registeredTeamUuids.includes(team.uuid))
              .map((team) => (
                <MenuItem key={team.uuid} value={team.uuid}>
                  {team.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <TextField
          label="Deployment URL"
          value={registerDeploymentUrl}
          onChange={(e) => setRegisterDeploymentUrl(e.target.value)}
          fullWidth
          sx={{ mt: 2 }}
          disabled={registering}
        />
        {registerError && (
          <div style={{ color: "red", marginTop: 8 }}>{registerError}</div>
        )}
        {registerSuccess && (
          <div style={{ color: "green", marginTop: 8 }}>{registerSuccess}</div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={registering}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleRegister}
          disabled={registering || !registerTeam}
        >
          {registering ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Register"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterProjectDialog;
