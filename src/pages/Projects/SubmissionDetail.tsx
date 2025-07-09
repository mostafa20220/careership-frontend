import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Link,
  Button,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Launch as LaunchIcon,
  GitHub as GitHubIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { fetchSubmissionDetail } from "../../services/api";
import type { SubmissionDetail } from "../../types/submission";

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

export default function SubmissionDetailPage() {
  const { projectId, taskId, submissionId } = useParams<{
    projectId: string;
    taskId: string;
    submissionId: string;
  }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && taskId && submissionId) {
      setLoading(true);
      fetchSubmissionDetail(projectId, taskId, submissionId)
        .then((res: any) => {
          setSubmission(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load submission details");
          setLoading(false);
        });
    }
  }, [projectId, taskId, submissionId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !submission) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || "Submission not found"}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Navigation */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            if (taskId) {
              // Go back to task-specific submissions
              navigate(`/projects/${projectId}/tasks/${taskId}/submissions`);
            } else {
              // Fallback to project submissions
              navigate(`/projects/${projectId}/submissions`);
            }
          }}
          sx={{ mb: 2 }}
        >
          Back to Submissions
        </Button>
      </Box>

      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Submission Details
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Submission #{submission.id}
      </Typography>

      {/* Submission Overview */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={submission.status}
                color={statusColor(submission.status)}
                size="medium"
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Passed Tests
              </Typography>
              <Typography variant="h6" color="success.main">
                {submission.passed_tests}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Success Rate
              </Typography>
              <Typography variant="h6" color="primary.main">
                {submission.passed_percentage}%
              </Typography>
            </Box>
          </Box>
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1">
                {new Date(submission.created_at).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Completed At
              </Typography>
              <Typography variant="body1">
                {submission.completed_at
                  ? new Date(submission.completed_at).toLocaleString()
                  : "Not completed"}
              </Typography>
            </Box>
            {submission.failed_test_index !== null && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Failed Test Index
                </Typography>
                <Typography variant="body1" color="error.main">
                  {submission.failed_test_index}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* External Links */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {submission.deployment_url && (
            <Button
              variant="outlined"
              startIcon={<LaunchIcon />}
              href={submission.deployment_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Deployment
            </Button>
          )}
          {submission.github_url && (
            <Button
              variant="outlined"
              startIcon={<GitHubIcon />}
              href={submission.github_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Repository
            </Button>
          )}
        </Box>
      </Paper>

      {/* Feedback */}
      {submission.feedback && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <InfoIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Feedback
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            {submission.feedback}
          </Alert>
        </Paper>
      )}

      {/* Execution Logs */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Execution Results
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Detailed results for each test case
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? theme.palette.grey[900]
                      : theme.palette.grey[100],
                }}
              >
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Test Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Task</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Points</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Feedback</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submission.execution_logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {log.passed ? (
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      ) : (
                        <CancelIcon color="error" sx={{ mr: 1 }} />
                      )}
                      <Chip
                        label={log.passed ? "Passed" : "Failed"}
                        color={log.passed ? "success" : "error"}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {log.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {log.task_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={log.passed ? "success.main" : "text.secondary"}
                      fontWeight={500}
                    >
                      {log.passed ? `+${log.points_earned}` : "0"} pts
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.feedback}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
