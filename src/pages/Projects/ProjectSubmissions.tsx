import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Link,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Launch as LaunchIcon,
  GitHub as GitHubIcon,
} from "@mui/icons-material";
import { fetchProjectSubmissions } from "../../services/api";
import type { Submission } from "../../types/submission";

const statusColor = (status: string) => {
  switch (status) {
    case "passed":
      return "success";
    case "failed":
      return "error";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

export default function ProjectSubmissions() {
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId?: string;
  }>();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchProjectSubmissions(projectId!, taskId)
      .then((res) => {
        setSubmissions(res.data);
        console.log(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load submissions");
        setLoading(false);
      });
  }, [projectId, taskId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb navigation */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            if (taskId) {
              navigate(`/projects/${projectId}/tasks/${taskId}`);
            } else {
              navigate(`/projects/${projectId}`);
            }
          }}
          sx={{ mb: 2 }}
        >
          {taskId ? "Back to Task" : "Back to Project"}
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        {taskId ? "Task Submissions" : "Project Submissions"}
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[900]
                      : theme.palette.grey[200],
                }}
              >
                <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                  User
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                  Team
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                  Task Order
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                  Success Rate
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                  Passed Tests
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                  Links
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                  Completed At
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow 
                  key={sub.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: (theme) => 
                        theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.04)' 
                          : 'rgba(0, 0, 0, 0.04)' 
                    }
                  }}
                >
                  <TableCell>
                    <Chip
                      label={sub.status}
                      color={statusColor(sub.status)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {sub.user}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sub.team}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`Task ${sub.task}`}
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {sub.passed_percentage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({sub.passed_tests} passed)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main">
                      {sub.passed_tests}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {sub.deployment_url && (
                        <Tooltip title="View Deployment">
                          <IconButton
                            size="small"
                            href={sub.deployment_url}
                            target="_blank"
                            color="primary"
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {sub.github_url && (
                        <Tooltip title="View Repository">
                          <IconButton
                            size="small"
                            href={sub.github_url}
                            target="_blank"
                            color="default"
                          >
                            <GitHubIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sub.completed_at
                        ? new Date(sub.completed_at).toLocaleDateString()
                        : "-"}
                    </Typography>
                    {sub.completed_at && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(sub.completed_at).toLocaleTimeString()}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          // Navigate to submission detail page
                          // We need to find the task ID, which we'll need to get from the API or current route
                          navigate(`/projects/${projectId}/tasks/${sub.task + 1}/submissions/${sub.id}`);
                        }}
                        color="primary"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
