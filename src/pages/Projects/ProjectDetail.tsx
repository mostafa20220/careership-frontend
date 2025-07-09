import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Alert,
  Button,
  Avatar,
  Paper,
  Breadcrumbs,
  Snackbar,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  ChevronRight as ChevronRightIcon,
  EmojiEvents as TrophyIcon,
  WorkspacePremium as CertificateIcon,
} from "@mui/icons-material";
import type { Project, Task } from "../../types/project";
import { difficultyColors, categoryColors } from "../../constants/projects";
import { taskStatusColors } from "../../constants/tasks";
import { useProjectById } from "../../hooks/useProjectHooks";
import {
  useCertificateAvailability,
  useRequestCertificate,
} from "../../hooks/useCertificateHooks";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import RegisterProjectDialog from "../../components/Projects/RegisterProjectDialog";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProjectById(Number(id));
  const { data: certificateData, isLoading: certificateLoading } =
    useCertificateAvailability(Number(id));
  const [showCertificateNotification, setShowCertificateNotification] =
    useState(false);
  const requestCertificateMutation = useRequestCertificate();
  const navigate = useNavigate();
  const theme = useTheme();
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

  const renderSkeleton = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
      <Skeleton
        variant="rectangular"
        width="100%"
        height={400}
        sx={{ mb: 3 }}
      />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Skeleton variant="text" width="60%" height={48} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={200} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Skeleton variant="rectangular" width="100%" height={300} />
        </Grid>
      </Grid>
    </Container>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  if (error || !project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load project
        </Alert>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleRequestCertificate = () => {
    requestCertificateMutation.mutate(project.id);
    setShowCertificateNotification(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 2 }}>
        <Button
          variant={theme.palette.mode === "dark" ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setRegisterDialogOpen(true)}
        >
          Register Team to Project
        </Button>
        <Button
          variant={theme.palette.mode === "dark" ? "contained" : "outlined"}
          color="primary"
          onClick={() => navigate(`/projects/${id}/submissions`)}
          sx={
            theme.palette.mode === "dark"
              ? { fontWeight: 700, boxShadow: 2 }
              : {}
          }
        >
          View Submissions
        </Button>
      </Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          to="/projects"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Typography color="text.secondary">Projects</Typography>
        </Link>
        <Typography color="text.primary">{project.name}</Typography>
      </Breadcrumbs>

      {/* Certificate Availability Notification */}
      {!certificateLoading && certificateData && (
        <Alert
          severity={certificateData.available ? "info" : "success"}
          icon={<SchoolIcon />}
          action={
            certificateData.available ? (
              <Button
                color="inherit"
                size="small"
                onClick={handleRequestCertificate}
                startIcon={<CheckCircleIcon />}
              >
                Request Certificate
              </Button>
            ) : (
              <Button
                color="inherit"
                size="small"
                onClick={() => navigate("/certificates")}
                startIcon={<CertificateIcon />}
              >
                View Certificates
              </Button>
            )
          }
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            {certificateData.available 
              ? "You can obtain a certificate for completing this project! Click the button to request your certificate."
              : "Certificate already issued for this project. View your certificates to download or share it."
            }
          </Typography>
        </Alert>
      )}

      {/* Project Header */}
      <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 5, boxShadow: 6 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? theme.palette.secondary.main
                    : "primary.main",
                fontSize: "1.5rem",
              }}
            >
              {project.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {project.name}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <CategoryIcon
                  sx={{
                    fontSize: 20,
                    color:
                      theme.palette.mode === "dark"
                        ? theme.palette.info.light
                        : "action.active",
                  }}
                />
                <Chip
                  label={project.category}
                  color={
                    categoryColors[
                      project.category as keyof typeof categoryColors
                    ] || "default"
                  }
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
          {project.is_premium && (
            <Chip
              icon={<StarIcon />}
              label="Premium"
              color="warning"
              variant="filled"
              size="small"
            />
          )}
        </Box>

        <Grid container spacing={0} alignItems="stretch">
          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{ pr: { md: 2 }, borderRight: { md: "1px solid #eee" } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingUpIcon
                sx={{
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.warning.light
                      : "action.active",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Difficulty:
              </Typography>
              <Chip
                label={project.difficulty_level}
                color={
                  difficultyColors[
                    project.difficulty_level as keyof typeof difficultyColors
                  ] || "default"
                }
                size="small"
              />
            </Box>
          </Grid>
          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{ pr: { md: 2 }, borderRight: { md: "1px solid #eee" } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <GroupIcon
                sx={{
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.secondary.light
                      : "action.active",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Team Size: {project.max_team_size}
              </Typography>
            </Box>
          </Grid>
          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
            sx={{ pr: { md: 2 }, borderRight: { md: "1px solid #eee" } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AssignmentIcon
                sx={{
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.success.light
                      : "action.active",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Tasks: {project.tasks?.length || 0}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ pl: { md: 2 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ScheduleIcon
                sx={{
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.light
                      : "action.active",
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(project.created_at)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tasks Section */}
      <Paper elevation={4} sx={{ p: 3, borderRadius: 4, mb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AssignmentIcon sx={{ mr: 1 }} />
            <Typography variant="h5" fontWeight={600}>
              Project Tasks
            </Typography>
            {/* Project completion indicator */}
            {project.tasks && project.tasks.length > 0 && project.tasks.every(task => task.is_passed) && (
              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrophyIcon sx={{ color: '#FFD700', fontSize: 24 }} />
                <Chip 
                  label="All Completed!" 
                  color="success" 
                  variant="filled"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            )}
          </Box>
          {/* Progress indicator */}
          {project.tasks && project.tasks.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
              <Typography variant="body2" color="text.secondary">
                {project.tasks.filter(task => task.is_passed).length}/{project.tasks.length}
              </Typography>
              <Box sx={{ 
                width: 80, 
                height: 6, 
                borderRadius: 3, 
                bgcolor: 'grey.300',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  width: `${(project.tasks.filter(task => task.is_passed).length / project.tasks.length) * 100}%`,
                  height: '100%',
                  bgcolor: project.tasks.every(task => task.is_passed) ? '#FFD700' : 'primary.main',
                  transition: 'width 0.3s ease, background-color 0.3s ease'
                }} />
              </Box>
            </Box>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {project.tasks && project.tasks.length > 0 ? (
          project.tasks.map((task, idx) => (
            <React.Fragment key={task.id}>
              <Box
                component={Link}
                to={`/projects/${project.id}/tasks/${task.id}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  borderRadius: 2,
                  transition: "background 0.2s, box-shadow 0.2s",
                  textDecoration: "none",
                  color: "inherit",
                  "&:hover": { background: "#f5f5f5", boxShadow: 2 },
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {task.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {formatDate(task.created_at)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label={task.difficulty_level} size="small" />
                  <ChevronRightIcon color="action" />
                </Box>
              </Box>
              {idx < project.tasks.length - 1 && <Divider sx={{ my: 2 }} />}
            </React.Fragment>
          ))
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No tasks available
          </Typography>
        )}
      </Paper>

      {/* Back Button */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          component={Link}
          to="/projects"
          variant={theme.palette.mode === "dark" ? "contained" : "outlined"}
          startIcon={<ArrowBackIcon />}
          size="large"
          sx={
            theme.palette.mode === "dark"
              ? { fontWeight: 700, boxShadow: 2 }
              : {}
          }
        >
          Back to Projects
        </Button>
      </Box>

      {/* Certificate Request Success Notification */}
      <Snackbar
        open={showCertificateNotification}
        autoHideDuration={6000}
        onClose={() => setShowCertificateNotification(false)}
        message="Certificate request submitted successfully!"
      />

      <RegisterProjectDialog
        open={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        projectId={id}
        onRegisterSuccess={() => {
          // Optionally refresh project data or show a notification
          setRegisterDialogOpen(false);
        }}
      />
    </Container>
  );
}
