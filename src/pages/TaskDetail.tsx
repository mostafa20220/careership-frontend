import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Task } from "../types/project";
import api from "../services/api";
import {
  Container,
  Typography,
  Box,
  Chip,
  Alert,
  Button,
  Divider,
  CircularProgress,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  Tooltip,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  FactCheck as FactCheckIcon,
  Send as SendIcon,
  FormatListBulleted as ListIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  PendingOutlined as PendingIcon,
  TrendingUp as HardIcon,
  TrendingFlat as MediumIcon,
  TrendingDown as EasyIcon,
} from "@mui/icons-material";
import { fetchProjectRegistrations, fetchTeams } from "../services/teams";
import { createSubmission } from "../services/api";
import type { Team } from "../types/team";

const DRAWER_WIDTH = 280;

export default function TaskDetail() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();

  const [task, setTask] = useState<Task | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [registeredTeamUuids, setRegisteredTeamUuids] = useState<string[]>([]);

  // Submission state
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !taskId) return;
      setLoading(true);
      try {
        // Fetch current task
        const taskResponse = await api.get(
          `/projects/${projectId}/tasks/${taskId}/`
        );
        setTask(taskResponse.data);

        // Fetch all project tasks
        const tasksResponse = await api.get(`/projects/${projectId}/tasks/`);
        setProjectTasks(tasksResponse.data);

        // Fetch teams and registrations
        const [teamsRes, registrationsRes] = await Promise.all([
          fetchTeams(),
          fetchProjectRegistrations(Number(projectId)),
        ]);

        setTeams(teamsRes.data);
        setRegisteredTeamUuids(
          registrationsRes.data.map((reg: any) => {
            const match = reg.team.match(/\(([0-9a-fA-F-]+)\)$/);
            return match ? match[1] : reg.team;
          })
        );
      } catch (err) {
        setError("Failed to load task data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, taskId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createSubmission(projectId!, taskId!, {
        team: selectedTeam,
        deployment_url: deploymentUrl,
        github_url: githubUrl,
      });
      setSubmitSuccess("Submission received and is being processed.");
      setSubmitDialogOpen(false);
      // Reset form
      setSelectedTeam("");
      setDeploymentUrl("");
      setGithubUrl("");
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getDifficultyIcon = (difficulty: number | string) => {
    const level = Number(difficulty);
    switch (level) {
      case 1:
        return <EasyIcon color="success" fontSize="small" />;
      case 2:
        return <MediumIcon color="warning" fontSize="small" />;
      default:
        return <HardIcon color="error" fontSize="small" />;
    }
  };

  const tasksList = (
    <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" noWrap color="text.primary">
          Project Tasks
        </Typography>
      </Box>
      <List sx={{ width: "100%" }}>
        {projectTasks.map((t) => {
          const isSelected = t.id === Number(taskId);
          return (
            <ListItem
              key={t.id}
              component={Link}
              to={`/projects/${projectId}/tasks/${t.id}`}
              sx={{
                textDecoration: "none",
                bgcolor: isSelected ? "primary.main" : "transparent",
                "&:hover": {
                  bgcolor: isSelected ? "primary.dark" : "action.hover",
                },
                "& .MuiListItemIcon-root, & .MuiListItemText-root": {
                  color: isSelected ? "primary.contrastText" : "text.primary",
                },
              }}
            >
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText
                primary={t.name}
                secondary={
                  <Box sx={{ mt: 0.5, display: "flex", alignItems: "center" }}>
                    <Tooltip title={`Difficulty: ${t.difficulty_level}`}>
                      <Box component="span" sx={{ display: "flex" }}>
                        {getDifficultyIcon(t.difficulty_level)}
                      </Box>
                    </Tooltip>
                  </Box>
                }
              />
              {isSelected && <ArrowDownIcon />}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !task) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || "Task not found"}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
      {/* Mobile Tasks Toggle */}
      {isMobile && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1100,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            py: 1,
          }}
        >
          <Button
            fullWidth
            onClick={handleDrawerToggle}
            startIcon={<ListIcon />}
            endIcon={mobileOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}
            variant="outlined"
            color="secondary"
            sx={{ justifyContent: "space-between" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography color="text.primary">Project Tasks</Typography>
              <Tooltip title="Tasks in progress">
                <PendingIcon
                  color="secondary"
                  sx={{
                    animation: "spin 2s linear infinite",
                    "@keyframes spin": {
                      "0%": {
                        transform: "rotate(0deg)",
                      },
                      "100%": {
                        transform: "rotate(360deg)",
                      },
                    },
                  }}
                />
              </Tooltip>
            </Box>
          </Button>
        </Box>
      )}

      {/* Sidebar/Drawer */}
      {isMobile ? (
        <Drawer
          anchor="top"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: "100%",
              maxHeight: "60vh",
              boxSizing: "border-box",
            },
          }}
        >
          {tasksList}
        </Drawer>
      ) : (
        <Paper
          elevation={2}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            height: "100vh",
            position: "sticky",
            top: 0,
            overflowY: "auto",
          }}
        >
          {tasksList}
        </Paper>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          {/* Task Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <AssignmentIcon color="primary" sx={{ fontSize: 40 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {task.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                {task.difficulty_level && (
                  <Tooltip title={`Difficulty: ${task.difficulty_level}`}>
                    <Chip
                      icon={getDifficultyIcon(task.difficulty_level)}
                      label={task.difficulty_level}
                      size="small"
                      color={
                        task.difficulty_level === "Easy"
                          ? "success"
                          : task.difficulty_level === "Medium"
                          ? "warning"
                          : "error"
                      }
                      variant="filled"
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Task Description */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <AssignmentIcon color="action" />
              Description
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                bgcolor: "grey.50",
                borderRadius: 2,
                "& p": { margin: 0 },
              }}
            >
              {task.description ? (
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {task.description}
                </Typography>
              ) : (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontStyle: "italic",
                    textAlign: "center",
                    py: 2,
                  }}
                >
                  No description available for this task
                </Typography>
              )}
            </Paper>
          </Box>

          {/* Task Info Cards */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <FactCheckIcon color="action" />
              Task Information
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  minWidth: 200,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: "background.paper",
                }}
              >
                <ScheduleIcon color="primary" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {task.duration_in_days} day
                    {task.duration_in_days !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  minWidth: 200,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  bgcolor: "background.paper",
                }}
              >
                <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {new Date(task.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </Paper>

              {task.tests && task.tests.length > 0 && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    minWidth: 200,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <FactCheckIcon color="info" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Tests Available
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {Array.isArray(task.tests) ? task.tests.length : 1} test
                      {(Array.isArray(task.tests) ? task.tests.length : 1) !== 1
                        ? "s"
                        : ""}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>

          {/* API Endpoints Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  fontSize: "1.2rem",
                  mr: 0.5,
                }}
              >
                🌐
              </Box>
              API Endpoints
              {task.endpoints &&
                Array.isArray(task.endpoints) &&
                task.endpoints.length > 0 && (
                  <Chip
                    label={task.endpoints.length}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
            </Typography>

            {task.endpoints &&
            Array.isArray(task.endpoints) &&
            task.endpoints.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {task.endpoints.map((endpoint: any, index: number) => (
                  <Paper
                    key={endpoint.id || index}
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        boxShadow: 2,
                        borderColor: "primary.main",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Chip
                        label={endpoint.method || "GET"}
                        size="small"
                        color={
                          endpoint.method === "POST"
                            ? "success"
                            : endpoint.method === "PUT" ||
                              endpoint.method === "PATCH"
                            ? "warning"
                            : endpoint.method === "DELETE"
                            ? "error"
                            : "info"
                        }
                        sx={{
                          fontWeight: "bold",
                          minWidth: 70,
                          fontFamily: "monospace",
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          component="code"
                          sx={{
                            fontFamily: "monospace",
                            bgcolor: "grey.100",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "1rem",
                            fontWeight: "bold",
                            color: "text.primary",
                            display: "inline-block",
                          }}
                        >
                          {endpoint.path || endpoint.url || "/"}
                        </Typography>
                        {endpoint.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, lineHeight: 1.6 }}
                          >
                            {endpoint.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: "center",
                  bgcolor: "grey.50",
                  borderStyle: "dashed",
                  borderColor: "grey.300",
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  No API endpoints defined for this task
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Submit Button */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SendIcon />}
              onClick={() => setSubmitDialogOpen(true)}
            >
              Submit Task
            </Button>
          </Box>
        </Paper>

        {/* Success Message */}
        {submitSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {submitSuccess}
          </Alert>
        )}
      </Box>

      {/* Submit Dialog */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submit Task</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Team</InputLabel>
            <Select
              value={selectedTeam}
              label="Team"
              onChange={(e) => setSelectedTeam(e.target.value)}
              disabled={submitting}
            >
              {teams
                .filter((team) => registeredTeamUuids.includes(team.uuid))
                .map((team) => (
                  <MenuItem key={team.uuid} value={team.uuid}>
                    {team.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            label="Deployment URL"
            value={deploymentUrl}
            onChange={(e) => setDeploymentUrl(e.target.value)}
            fullWidth
            margin="normal"
            disabled={submitting}
          />
          <TextField
            label="GitHub URL"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            fullWidth
            margin="normal"
            disabled={submitting}
          />
          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSubmitDialogOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !selectedTeam}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
