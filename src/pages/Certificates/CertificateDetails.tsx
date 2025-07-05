import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Paper,
  Breadcrumbs,
  Grid,
  Chip,
  Divider,
  Alert,
  Skeleton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  useGetCertificate,
  useDownloadCertificate,
  usePreviewCertificate,
} from "../../hooks/useCertificateHooks";
import { useProjectById } from "../../hooks/useProjectHooks";
import { useUser } from "../../hooks/useUserHooks";

export default function CertificateDetails() {
  const { certificate_no } = useParams<{ certificate_no: string }>();
  const {
    data: certificate,
    isLoading,
    error,
  } = useGetCertificate(certificate_no || "");
  const { data: project } = useProjectById(certificate?.project_id || 0);
  const { data: userData, isLoading: userLoading } = useUser();
  const downloadMutation = useDownloadCertificate();
  const previewCertificate = usePreviewCertificate();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDownload = async () => {
    try {
      await downloadMutation.mutateAsync(certificate_no || "");
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handlePreview = async () => {
    try {
      const blob = await previewCertificate.mutateAsync(certificate_no || "");
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Failed to load PDF preview:", error);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  if (isLoading) {
    return (
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
  }

  if (error || !certificate) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load certificate
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          to="/certificates"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Typography color="text.secondary">Certificates</Typography>
        </Link>
        <Typography color="text.primary">
          Certificate #{certificate.no}
        </Typography>
      </Breadcrumbs>

      {/* Certificate Header */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: "center" }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "success.main",
              fontSize: "2rem",
            }}
          >
            <SchoolIcon sx={{ fontSize: 40 }} />
          </Avatar>
        </Box>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ color: "success.main" }}
        >
          Certificate of Completion
        </Typography>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          Certificate #{certificate.no}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<VisibilityIcon />}
            onClick={handlePreview}
            sx={{ mr: 2 }}
          >
            Preview Certificate
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={
              downloadMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                <DownloadIcon />
              )
            }
            onClick={handleDownload}
            disabled={downloadMutation.isPending}
            sx={{ mr: 2 }}
          >
            {downloadMutation.isPending ? "Downloading..." : "Download PDF"}
          </Button>

          <Button
            component={Link}
            to="/certificates"
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
          >
            Back to Certificates
          </Button>

          {/* Success Message for Download */}
          {downloadMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Certificate downloaded successfully!
            </Alert>
          )}

          {/* Error Message for Download */}
          {downloadMutation.error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              Failed to download certificate. Please try again.
            </Alert>
          )}
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Certificate Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <AssignmentIcon />
              Certificate Information
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Certificate Number
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: "monospace" }}>
                    {certificate.no}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Issue Date
                  </Typography>
                  <Typography variant="h6">
                    {formatDate(certificate.created_at)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Status
                  </Typography>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Issued"
                    color="success"
                    variant="filled"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Project Information */}
          {project && (
            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <AssignmentIcon />
                Project Information
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  {project.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.category}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {project.description || "No description available"}
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Completed: {formatDate(project.created_at)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AssignmentIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Tasks Completed: {project.tasks?.length || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Grid>

        {/* User Information */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 4 }}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <PersonIcon />
              User Information
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {userLoading ? (
              <Box sx={{ textAlign: "center" }}>
                <Skeleton
                  variant="circular"
                  width={80}
                  height={80}
                  sx={{ mx: "auto", mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width={150}
                  height={32}
                  sx={{ mx: "auto", mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width={120}
                  height={24}
                  sx={{ mx: "auto" }}
                />
              </Box>
            ) : userData ? (
              <>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: "primary.main",
                      fontSize: "1.5rem",
                      mx: "auto",
                      mb: 2,
                    }}
                    src={userData.avatar || undefined}
                    alt={`${userData.first_name} ${userData.last_name}`}
                  >
                    {userData.first_name?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {userData.first_name} {userData.last_name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {userData.user_type}{" "}
                    {userData.is_premium ? "(Premium)" : ""}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Certificate Recipient
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "monospace", fontSize: "0.9rem" }}
                  >
                    {userData.email}
                  </Typography>
                </Box>

                {userData.phone && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Phone
                    </Typography>
                    <Typography variant="body1">{userData.phone}</Typography>
                  </Box>
                )}

                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Certificate Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This certificate confirms successful completion of the
                    project and demonstrates the skills and knowledge acquired
                    during the development process.
                  </Typography>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.main",
                    fontSize: "1.5rem",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  U
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  User #{certificate.user_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Certificate Recipient
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* PDF Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              height: "90vh",
              maxHeight: "90vh",
            },
          },
        }}
        disableRestoreFocus
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Certificate Preview - #{certificate.no}</Typography>
          <IconButton
            aria-label="close"
            onClick={handleClosePreview}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: "100%" }}>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              title="Certificate Preview"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
