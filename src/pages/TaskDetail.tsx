import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Task, Project } from "../types/project";
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
  Card,
  CardContent,
  Avatar,
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
  Lock as LockIcon,
  PersonAdd as RegisterIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Celebration as CelebrationIcon,
  WorkspacePremium as CertificateIcon,
} from "@mui/icons-material";
import { fetchProjectRegistrations, fetchTeams } from "../services/teams";
import { createSubmission } from "../services/api";
import type { Team } from "../types/team";
import { useAuthStore } from "../store/authStore";
import { useCertificateAvailability } from "../hooks/useCertificateHooks";

const DRAWER_WIDTH = 280;

export default function TaskDetail() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();

  // Authentication
  const { isAuthenticated, user } = useAuthStore();

  // Certificate availability
  const { data: certificateData } = useCertificateAvailability(
    Number(projectId)
  );

  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [registeredTeamUuids, setRegisteredTeamUuids] = useState<string[]>([]);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

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

  // Helper function to check if user can access a specific task
  const checkTaskAccess = (taskToCheck: Task, allTasks: Task[]): boolean => {
    // Sort tasks by order (or by ID if order is not available)
    const sortedTasks = [...allTasks].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return a.id - b.id;
    });

    const currentTaskIndex = sortedTasks.findIndex(
      (t) => t.id === taskToCheck.id
    );

    // First task is always accessible
    if (currentTaskIndex === 0) {
      return true;
    }

    // Check if all previous tasks have been passed
    for (let i = 0; i < currentTaskIndex; i++) {
      const previousTask = sortedTasks[i];
      if (!previousTask.is_passed) {
        return false;
      }
    }

    return true;
  };

  // Check if current task can be accessed
  const canAccessCurrentTask =
    task && projectTasks.length > 0
      ? checkTaskAccess(task, projectTasks)
      : true;

  // Check if all project tasks are completed
  const isProjectCompleted =
    projectTasks.length > 0 && projectTasks.every((task) => task.is_passed);

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      if (!projectId || !taskId) return;
      setLoading(true);
      setCheckingRegistration(true);

      try {
        // Fetch project information to check registration status
        const projectResponse = await api.get(`/projects/${projectId}/`);
        setProject(projectResponse.data);

        // Fetch current task
        const taskResponse = await api.get(
          `/projects/${projectId}/tasks/${taskId}/`
        );
        setTask(taskResponse.data);

        // Fetch all project tasks
        const tasksResponse = await api.get(`/projects/${projectId}/tasks/`);
        setProjectTasks(tasksResponse.data);

        // Fetch teams and registrations for submission functionality
        const [teamsRes, registrationsRes] = await Promise.all([
          fetchTeams(),
          fetchProjectRegistrations(Number(projectId)),
        ]);

        setTeams(teamsRes.data);

        const registeredTeams = registrationsRes.data.map((reg: any) => {
          const match = reg.team.match(/\(([0-9a-fA-F-]+)\)$/);
          return match ? match[1] : reg.team;
        });

        setRegisteredTeamUuids(registeredTeams);
      } catch (err) {
        setError("Failed to load task data");
      } finally {
        setLoading(false);
        setCheckingRegistration(false);
      }
    };

    fetchData();
  }, [projectId, taskId, isAuthenticated, navigate]);

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" noWrap color="text.primary">
            Project Tasks
          </Typography>
          {isProjectCompleted && (
            <Tooltip title="All tasks completed!">
              <TrophyIcon sx={{ color: "#FFD700", fontSize: 24 }} />
            </Tooltip>
          )}
        </Box>
        {projectTasks.length > 0 && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {projectTasks.filter((t) => t.is_passed).length}/
              {projectTasks.length} completed
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                height: 4,
                borderRadius: 2,
                bgcolor: "grey.300",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${
                    (projectTasks.filter((t) => t.is_passed).length /
                      projectTasks.length) *
                    100
                  }%`,
                  height: "100%",
                  bgcolor: isProjectCompleted ? "#FFD700" : "primary.main",
                  transition: "width 0.3s ease, background-color 0.3s ease",
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
      <List sx={{ width: "100%" }}>
        {projectTasks.map((t) => {
          const isSelected = t.id === Number(taskId);
          const canAccessThisTask = checkTaskAccess(t, projectTasks);
          const isPassed = t.is_passed;

          return (
            <ListItem
              key={t.id}
              component={canAccessThisTask ? Link : "div"}
              to={
                canAccessThisTask
                  ? `/projects/${projectId}/tasks/${t.id}`
                  : undefined
              }
              sx={{
                textDecoration: "none",
                bgcolor: isSelected ? "primary.main" : "transparent",
                opacity: canAccessThisTask ? 1 : 0.6,
                cursor: canAccessThisTask ? "pointer" : "default",
                "&:hover": {
                  bgcolor: canAccessThisTask
                    ? isSelected
                      ? "primary.dark"
                      : "action.hover"
                    : "transparent",
                },
                "& .MuiListItemIcon-root, & .MuiListItemText-root": {
                  color: isSelected ? "primary.contrastText" : "text.primary",
                },
              }}
            >
              <ListItemIcon>
                {isPassed ? (
                  <CheckCircleIcon color="success" />
                ) : canAccessThisTask ? (
                  <AssignmentIcon />
                ) : (
                  <LockIcon color="disabled" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" noWrap>
                      {t.name}
                    </Typography>
                    {isPassed && (
                      <Chip
                        label="Passed"
                        size="small"
                        color="success"
                        variant="filled"
                        sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                    )}
                    {!canAccessThisTask && !isPassed && (
                      <Chip
                        label="Locked"
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  t.difficulty_level && (
                    <Box
                      sx={{ mt: 0.5, display: "flex", alignItems: "center" }}
                    >
                      <Tooltip title={`Difficulty: ${t.difficulty_level}`}>
                        <Box component="span" sx={{ display: "flex" }}>
                          {getDifficultyIcon(t.difficulty_level)}
                        </Box>
                      </Tooltip>
                    </Box>
                  )
                }
              />
              {isSelected && <ArrowDownIcon />}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  if (loading || checkingRegistration) {
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

  // Check if user is registered for this project
  if (project && !project.is_registered) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Breadcrumb navigation */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="text"
            onClick={() => navigate("/projects")}
            sx={{ mb: 1 }}
          >
            ← Back to Projects
          </Button>
        </Box>

        <Paper
          elevation={2}
          sx={{ p: 4, textAlign: "center", borderRadius: 2 }}
        >
          <Box sx={{ mb: 3 }}>
            <LockIcon sx={{ fontSize: 64, color: "warning.main", mb: 2 }} />
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              color="text.primary"
            >
              Registration Required
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.6 }}
            >
              You need to register a team for this project before accessing task
              details. Registration ensures you're part of the project and can
              submit your work.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<RegisterIcon />}
              onClick={() => navigate(`/projects/${projectId}`)}
              sx={{ minWidth: 200 }}
            >
              Register for Project
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={() => navigate("/projects")}
              sx={{ minWidth: 150 }}
            >
              Browse Projects
            </Button>
          </Box>

          <Alert severity="info" sx={{ mt: 3, textAlign: "left" }}>
            <Typography variant="body2">
              <strong>How to register:</strong>
              <br />
              1. Go to the project page
              <br />
              2. Create or join a team
              <br />
              3. Register your team for this project
              <br />
              4. Return here to access task details
            </Typography>
          </Alert>
        </Paper>
      </Container>
    );
  }

  // Check if user can access this task (must complete previous tasks first)
  if (project && project.is_registered && !canAccessCurrentTask) {
    const sortedTasks = [...projectTasks].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return a.id - b.id;
    });
    const currentTaskIndex = sortedTasks.findIndex((t) => t.id === task.id);
    const previousTask =
      currentTaskIndex > 0 ? sortedTasks[currentTaskIndex - 1] : null;

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Breadcrumb navigation */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="text"
            onClick={() => navigate(`/projects/${projectId}`)}
            sx={{ mb: 1 }}
          >
            ← Back to Project
          </Button>
        </Box>

        <Paper
          elevation={2}
          sx={{ p: 4, textAlign: "center", borderRadius: 2 }}
        >
          <Box sx={{ mb: 3 }}>
            <LockIcon sx={{ fontSize: 64, color: "warning.main", mb: 2 }} />
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              color="text.primary"
            >
              Task Locked
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.6 }}
            >
              You need to complete and pass the previous task before accessing
              this one. This ensures you have the necessary knowledge and skills
              to tackle "{task.name}".
            </Typography>
          </Box>

          {previousTask && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ textAlign: "left" }}>
                <Typography variant="body2">
                  <strong>Complete this task first:</strong>
                  <br />
                  📋 {previousTask.name}
                  <br />
                  <br />
                  <strong>Requirements to unlock:</strong>
                  <br />
                  • Submit your solution for the previous task
                  <br />
                  • Achieve a passing score
                  <br />• Wait for task completion confirmation
                </Typography>
              </Alert>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {previousTask && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() =>
                  navigate(`/projects/${projectId}/tasks/${previousTask.id}`)
                }
                sx={{ minWidth: 200 }}
              >
                Go to Previous Task
              </Button>
            )}
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={() => navigate(`/projects/${projectId}`)}
              sx={{ minWidth: 150 }}
            >
              Back to Project
            </Button>
          </Box>
        </Paper>
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
        {/* Project Completion Celebration */}
        {isProjectCompleted && (
          <Card
            elevation={3}
            sx={{
              mb: 4,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: -50,
                right: -50,
                width: 100,
                height: 100,
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 80,
                height: 80,
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
              },
            }}
          >
            <CardContent sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 3, mb: 2 }}
              >
                <Avatar
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    width: 64,
                    height: 64,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <TrophyIcon sx={{ fontSize: 32, color: "#FFD700" }} />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="h5" component="h2" fontWeight="bold">
                      🎉 Project Completed!
                    </Typography>
                    <CelebrationIcon sx={{ fontSize: 28, color: "#FFD700" }} />
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ opacity: 0.9, lineHeight: 1.6 }}
                  >
                    Congratulations! You've successfully completed all tasks in
                    this project. You can now request your certificate to
                    showcase your achievement.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
                {certificateData?.available ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<StarIcon />}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                    onClick={() => navigate(`/projects/${projectId}`)}
                  >
                    Request Certificate
                  </Button>
                ) : certificateData && !certificateData.available ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CertificateIcon />}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                    onClick={() => navigate("/certificates")}
                  >
                    View Certificates
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<StarIcon />}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                    onClick={() => navigate(`/projects/${projectId}`)}
                  >
                    Request Certificate
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                  onClick={() => navigate(`/projects/${projectId}/submissions`)}
                >
                  View All Submissions
                </Button>
              </Box>

              <Box
                sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Progress: {projectTasks.filter((t) => t.is_passed).length}/
                  {projectTasks.length} tasks completed
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "rgba(255, 255, 255, 0.3)",
                    ml: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      bgcolor: "#4CAF50",
                      borderRadius: 3,
                      boxShadow: "0 0 10px rgba(76, 175, 80, 0.5)",
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

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

          {/* Action Buttons */}
          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={() => navigate(`/projects/${projectId}`)}
              >
                ← Back to Project
              </Button>
              <Button
                variant="outlined"
                color="info"
                size="large"
                onClick={() =>
                  navigate(`/projects/${projectId}/tasks/${taskId}/submissions`)
                }
              >
                View Submissions
              </Button>
            </Box>
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
