import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  Container,
  Skeleton,
  Fab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  LinearProgress,
  Fade,
  IconButton,
  Menu,
  ListItemIcon,
} from "@mui/material";
import {
  Add as AddIcon,
  SmartToy as AIIcon,
  Edit as EditIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  Send as SendIcon,
  AutoAwesome as RefineIcon,
  FlashOn as LightningIcon,
  Code as CodeIcon,
  Assignment as TaskIcon,
  CheckCircle as CheckIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useAIProjectStore } from "../../store/aiProjectStore";
import type { CreateProjectDraftRequest } from "../../services/aiProjectDrafts";

// Constants from Projects page
const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];
const CATEGORY_OPTIONS = ["Frontend", "Backend", "Fullstack"];

// Map display names to IDs (you'll need to adjust these based on your actual API)
const DIFFICULTY_MAP: Record<string, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

const CATEGORY_MAP: Record<string, number> = {
  Frontend: 1,
  Backend: 2,
  Fullstack: 3,
};

interface CreateDraftFormData {
  name: string;
  category: string;
  difficulty: string;
  isPublic: boolean;
}

interface EditDraftFormData {
  name: string;
  isPublic: boolean;
}

const DraftSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 1 }}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Box key={item} sx={{ mb: 1 }}>
          <Skeleton
            variant="rectangular"
            height={80}
            sx={{ borderRadius: 1, mb: 0.5 }}
          />
        </Box>
      ))}
    </Box>
  );
};

const ProjectContentSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 3 }} />
      <Skeleton
        variant="rectangular"
        height={200}
        sx={{ borderRadius: 1, mb: 2 }}
      />
      <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
    </Box>
  );
};

const GeneratingLoadingIndicator: React.FC = () => {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        height: 200,
        borderRadius: 2,
        bgcolor: "grey.50",
      }}
    >
      {/* Background pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          opacity: 0.3,
        }}
      />

      {/* Lightning animation */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          left: 0,
          right: 0,
          height: 50,
          background:
            "linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.3), rgba(25, 118, 210, 0.6), rgba(25, 118, 210, 0.3), transparent)",
          animation: "lightning 2s ease-in-out infinite",
          "@keyframes lightning": {
            "0%": {
              transform: "translateY(0px)",
              opacity: 0,
            },
            "50%": {
              transform: "translateY(150px)",
              opacity: 1,
            },
            "100%": {
              transform: "translateY(300px)",
              opacity: 0,
            },
          },
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <LightningIcon
          sx={{
            fontSize: 48,
            color: "primary.main",
            mb: 2,
            animation: "pulse 1.5s ease-in-out infinite",
            "@keyframes pulse": {
              "0%": { opacity: 0.5, transform: "scale(1)" },
              "50%": { opacity: 1, transform: "scale(1.1)" },
              "100%": { opacity: 0.5, transform: "scale(1)" },
            },
          }}
        />
        <Typography variant="h6" color="primary" gutterBottom>
          AI is generating your project...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This may take a few moments. Please wait while the AI crafts your
          perfect project.
        </Typography>
      </Box>
    </Box>
  );
};

const CreateDraftDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDraftFormData) => void;
  loading: boolean;
}> = ({ open, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState<CreateDraftFormData>({
    name: "",
    category: "",
    difficulty: "",
    isPublic: false,
  });

  const handleSubmit = () => {
    if (formData.category && formData.difficulty) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      category: "",
      difficulty: "",
      isPublic: false,
    });
    onClose();
  };

  const isValid = formData.category && formData.difficulty;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New AI Project Draft</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            fullWidth
            label="Project Name (Optional)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Leave empty for AI to suggest a name"
          />

          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              {CATEGORY_OPTIONS.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Difficulty Level</InputLabel>
            <Select
              value={formData.difficulty}
              label="Difficulty Level"
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
            >
              {DIFFICULTY_OPTIONS.map((difficulty) => (
                <MenuItem key={difficulty} value={difficulty}>
                  {difficulty}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
              />
            }
            label="Make this project public"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid || loading}
        >
          {loading ? "Creating..." : "Create Draft"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditDraftDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditDraftFormData) => void;
  loading: boolean;
  initialData?: { name: string; is_public: boolean };
}> = ({ open, onClose, onSubmit, loading, initialData }) => {
  const [formData, setFormData] = useState<EditDraftFormData>({
    name: "",
    isPublic: false,
  });

  // Update form data when dialog opens with initial data
  useEffect(() => {
    if (open && initialData) {
      setFormData({
        name: initialData.name || "",
        isPublic: initialData.is_public,
      });
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    // At least one field should be filled
    if (formData.name.trim() || formData.isPublic !== initialData?.is_public) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      isPublic: false,
    });
    onClose();
  };

  // Check if form is valid (at least one field changed)
  const isValid =
    formData.name.trim() !== initialData?.name ||
    formData.isPublic !== initialData?.is_public;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Draft Information</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            fullWidth
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter project name"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
              />
            }
            label="Make this project public"
          />

          {!isValid && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Please modify at least one field to save changes.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid || loading}
        >
          {loading ? "Updating..." : "Update Draft"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AIProjectDrafts: React.FC = () => {
  const {
    drafts,
    selectedDraftId,
    selectDraft,
    fetchDrafts,
    isLoading,
    error,
    createDraft,
    refineDraft,
    finalizeDraft,
    updateDraft,
    deleteDraft,
    isPolling,
    stopPollingDraft,
    isFetchingDraftDetails,
  } = useAIProjectStore();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDraftForMenu, setSelectedDraftForMenu] = useState<
    number | null
  >(null);

  const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId);

  useEffect(() => {
    fetchDrafts();
    // Cleanup polling on unmount
    return () => {
      stopPollingDraft();
    };
  }, [fetchDrafts, stopPollingDraft]);

  const handleCreateDraft = async (formData: CreateDraftFormData) => {
    try {
      const payload: CreateProjectDraftRequest = {
        name: formData.name || undefined,
        category_id: CATEGORY_MAP[formData.category],
        difficulty_level_id: DIFFICULTY_MAP[formData.difficulty],
        is_public: formData.isPublic,
      };

      console.log("Creating draft with payload:", payload);
      console.log("Form data category:", formData.category);
      console.log("Mapped category_id:", CATEGORY_MAP[formData.category]);
      
      await createDraft(payload);
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create draft:", error);
    }
  };

  const handleEditDraft = async (formData: EditDraftFormData) => {
    if (selectedDraftForMenu) {
      try {
        const updateData: { name?: string; is_public?: boolean } = {};

        // Only include fields that were actually changed
        const currentDraft = drafts.find((d) => d.id === selectedDraftForMenu);
        if (
          formData.name.trim() &&
          formData.name.trim() !== currentDraft?.name
        ) {
          updateData.name = formData.name.trim();
        }
        if (formData.isPublic !== currentDraft?.is_public) {
          updateData.is_public = formData.isPublic;
        }

        if (Object.keys(updateData).length > 0) {
          await updateDraft(selectedDraftForMenu, updateData);
        }

        setEditDialogOpen(false);
        handleCloseMenu();
      } catch (error) {
        console.error("Failed to update draft:", error);
      }
    }
  };

  const handleDeleteDraft = async () => {
    if (selectedDraftForMenu) {
      try {
        await deleteDraft(selectedDraftForMenu);
        handleCloseMenu();
      } catch (error) {
        console.error("Failed to delete draft:", error);
      }
    }
  };

  const handleRefineDraft = async () => {
    if (refinePrompt.trim() && selectedDraftId) {
      try {
        await refineDraft(selectedDraftId, refinePrompt.trim());
        setRefinePrompt("");
      } catch (error) {
        console.error("Failed to refine draft:", error);
      }
    }
  };

  const handleFinalizeDraft = async () => {
    if (selectedDraftId) {
      try {
        await finalizeDraft(selectedDraftId);
        // The store will handle removing the draft from the list and clearing selection
      } catch (error) {
        console.error("Failed to finalize draft:", error);
      }
    }
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    draftId: number
  ) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedDraftForMenu(draftId);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedDraftForMenu(null);
  };

  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
    handleCloseMenu();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleRefineDraft();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container maxWidth="xl" sx={{ height: "calc(100vh - 100px)", py: 2 }}>
      <Box sx={{ display: "flex", height: "100%", gap: 2 }}>
        {/* Left Sidebar - Drafts List */}
        <Paper
          elevation={2}
          sx={{
            width: 320,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" gutterBottom>
              AI Project Drafts
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Chip label={`${drafts.length} Drafts`} size="small" />
            </Box>
          </Box>

          {/* Drafts List */}
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            {isLoading ? (
              <DraftSkeleton />
            ) : (
              <List disablePadding>
                {drafts.map((draft) => (
                  <ListItem key={draft.id} disablePadding>
                    <ListItemButton
                      selected={selectedDraftId === draft.id}
                      onClick={() => selectDraft(draft.id)}
                      disabled={isFetchingDraftDetails}
                      sx={{
                        py: 2,
                        px: 2,
                        "&.Mui-selected": {
                          bgcolor: "primary.50",
                          borderRight: 3,
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <ListItemText
                        primary={draft.name || "Untitled Project"}
                        secondary={
                          !draft.name ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(draft.created_at)}
                            </Typography>
                          ) : null
                        }
                        primaryTypographyProps={{
                          fontWeight: selectedDraftId === draft.id ? 600 : 400,
                          noWrap: true,
                        }}
                      />
                      <Box
                        sx={{
                          ml: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        {draft.is_public ? (
                          <PublicIcon fontSize="small" color="primary" />
                        ) : (
                          <PrivateIcon fontSize="small" color="action" />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, draft.id)}
                          sx={{ p: 0.5 }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}

            {drafts.length === 0 && !isLoading && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <AIIcon sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No drafts yet. Create your first AI project!
                </Typography>
              </Box>
            )}
          </Box>

          {/* Add New Draft Button */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Fab
              size="small"
              color="primary"
              onClick={() => setCreateDialogOpen(true)}
              sx={{ width: "100%", borderRadius: 2 }}
            >
              <AddIcon />
            </Fab>
          </Box>
        </Paper>

        {/* Right Side - Project Content */}
        <Paper
          elevation={2}
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Typography variant="h6" color="primary">
                {selectedDraft?.name || "Select a draft"}
              </Typography>

              {/* Finalize Button in Header */}
              {selectedDraft &&
                selectedDraft.status !== "generating" &&
                selectedDraft.status !== "completed" &&
                selectedDraft.latest_project_json &&
                Object.keys(selectedDraft.latest_project_json).length > 0 && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleFinalizeDraft}
                    disabled={isLoading || isPolling}
                    startIcon={<CheckIcon />}
                    size="small"
                    sx={{
                      px: 2,
                      "&:disabled": {
                        bgcolor: "grey.300",
                        color: "grey.500",
                      },
                    }}
                  >
                    {isLoading ? "Finalizing..." : "Finalize Project"}
                  </Button>
                )}
            </Box>

            {selectedDraft && (
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Chip
                  label={selectedDraft.category}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={selectedDraft.difficulty_level}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={selectedDraft.status.replace("_", " ")}
                  size="small"
                  color={
                    selectedDraft.status === "completed"
                      ? "success"
                      : selectedDraft.status === "pending_review"
                      ? "warning"
                      : "default"
                  }
                  sx={{ textTransform: "capitalize" }}
                />
                <Chip
                  icon={
                    selectedDraft.is_public ? <PublicIcon /> : <PrivateIcon />
                  }
                  label={selectedDraft.is_public ? "Public" : "Private"}
                  size="small"
                  variant="outlined"
                />
              </Box>
            )}
          </Box>

          {/* Project Content Area */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {isFetchingDraftDetails ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : !selectedDraft ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <AIIcon sx={{ fontSize: 80, color: "grey.300" }} />
                <Typography variant="h6" color="text.secondary">
                  Select a draft to view project details
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  Choose a draft from the sidebar or create a new one to get
                  started
                </Typography>
              </Box>
            ) : selectedDraft.status === "generating" ? (
              <Box>
                <GeneratingLoadingIndicator />
                {isPolling && (
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Checking for updates every 3 seconds...
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : isLoading ? (
              <ProjectContentSkeleton />
            ) : (
              <Box>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Project Overview
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      Created on {formatDate(selectedDraft.created_at)}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1">
                      {selectedDraft.status === "pending_review"
                        ? "Your project draft is ready for review! The AI has generated the project content based on your requirements."
                        : selectedDraft.status === "completed"
                        ? "This project has been completed and finalized."
                        : selectedDraft.status === "archived"
                        ? "This draft has been archived due to generation failure. Please try refining with different requirements."
                        : "This is where the AI-generated project content will be displayed. The project details, structure, and implementation guidelines will appear here once the AI processes the draft requirements."}
                    </Typography>

                    {selectedDraft.latest_project_json &&
                      Object.keys(selectedDraft.latest_project_json).length >
                        0 && (
                        <Box sx={{ mt: 3 }}>
                          {/* Project Header */}
                          {selectedDraft.latest_project_json.name && (
                            <Box
                              sx={{
                                mb: 3,
                                p: 3,
                                bgcolor: "primary.50",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "primary.200",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 2,
                                }}
                              >
                                <CodeIcon
                                  color="primary"
                                  sx={{ fontSize: 28 }}
                                />
                                <Typography
                                  variant="h5"
                                  color="primary.main"
                                  fontWeight="bold"
                                >
                                  {selectedDraft.latest_project_json.name}
                                </Typography>
                              </Box>

                              {selectedDraft.latest_project_json
                                .description && (
                                <Typography
                                  variant="body1"
                                  color="text.primary"
                                  paragraph
                                >
                                  {
                                    selectedDraft.latest_project_json
                                      .description
                                  }
                                </Typography>
                              )}

                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                  mt: 2,
                                }}
                              >
                                {selectedDraft.latest_project_json.category && (
                                  <Chip
                                    label={
                                      selectedDraft.latest_project_json.category
                                    }
                                    color="primary"
                                    variant="filled"
                                  />
                                )}
                                {selectedDraft.latest_project_json
                                  .difficulty_level && (
                                  <Chip
                                    label={
                                      selectedDraft.latest_project_json
                                        .difficulty_level
                                    }
                                    color="secondary"
                                    variant="filled"
                                  />
                                )}
                                {selectedDraft.latest_project_json
                                  .max_team_size && (
                                  <Chip
                                    label={`Team Size: ${selectedDraft.latest_project_json.max_team_size}`}
                                    variant="outlined"
                                  />
                                )}
                                {selectedDraft.latest_project_json
                                  .is_premium !== undefined && (
                                  <Chip
                                    label={
                                      selectedDraft.latest_project_json
                                        .is_premium
                                        ? "Premium"
                                        : "Free"
                                    }
                                    color={
                                      selectedDraft.latest_project_json
                                        .is_premium
                                        ? "warning"
                                        : "success"
                                    }
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          )}

                          {/* Project Tasks */}
                          {selectedDraft.latest_project_json.tasks &&
                            Array.isArray(
                              selectedDraft.latest_project_json.tasks
                            ) && (
                              <Box sx={{ mb: 3 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 3,
                                  }}
                                >
                                  <TaskIcon
                                    color="action"
                                    sx={{ fontSize: 28 }}
                                  />
                                  <Typography variant="h5" fontWeight="bold">
                                    Project Tasks (
                                    {
                                      selectedDraft.latest_project_json.tasks
                                        .length
                                    }
                                    )
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 3,
                                  }}
                                >
                                  {selectedDraft.latest_project_json.tasks.map(
                                    (task: any, index: number) => (
                                      <Card
                                        key={index}
                                        variant="outlined"
                                        sx={{ bgcolor: "grey.50" }}
                                      >
                                        <CardContent>
                                          <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            gutterBottom
                                            color="primary"
                                          >
                                            Task {index + 1}: {task.name}
                                          </Typography>

                                          {task.description && (
                                            <Typography
                                              variant="body1"
                                              color="text.secondary"
                                              paragraph
                                            >
                                              {task.description}
                                            </Typography>
                                          )}

                                          {/* Task Details */}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              gap: 1,
                                              flexWrap: "wrap",
                                              mb: 2,
                                            }}
                                          >
                                            {task.difficulty_level && (
                                              <Chip
                                                label={`Difficulty: ${task.difficulty_level}`}
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                              />
                                            )}
                                            {task.duration_in_days && (
                                              <Chip
                                                label={`Duration: ${
                                                  task.duration_in_days
                                                } day${
                                                  task.duration_in_days > 1
                                                    ? "s"
                                                    : ""
                                                }`}
                                                size="small"
                                                color="info"
                                                variant="outlined"
                                              />
                                            )}
                                            {task.order !== undefined && (
                                              <Chip
                                                label={`Order: ${
                                                  task.order + 1
                                                }`}
                                                size="small"
                                                variant="outlined"
                                              />
                                            )}
                                          </Box>

                                          {/* Prerequisites */}
                                          {task.prerequisites &&
                                            Array.isArray(task.prerequisites) &&
                                            task.prerequisites.length > 0 && (
                                              <Box sx={{ mb: 2 }}>
                                                <Typography
                                                  variant="subtitle2"
                                                  gutterBottom
                                                >
                                                  📚 Prerequisites:
                                                </Typography>
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    flexWrap: "wrap",
                                                  }}
                                                >
                                                  {task.prerequisites.map(
                                                    (
                                                      prereq: string,
                                                      prereqIndex: number
                                                    ) => (
                                                      <Chip
                                                        key={prereqIndex}
                                                        label={prereq}
                                                        size="small"
                                                        color="default"
                                                        variant="outlined"
                                                      />
                                                    )
                                                  )}
                                                </Box>
                                              </Box>
                                            )}

                                          {/* API Endpoints */}
                                          {task.endpoints &&
                                            Array.isArray(task.endpoints) &&
                                            task.endpoints.length > 0 && (
                                              <Box sx={{ mb: 2 }}>
                                                <Typography
                                                  variant="subtitle2"
                                                  gutterBottom
                                                >
                                                  🌐 API Endpoints (
                                                  {task.endpoints.length}):
                                                </Typography>
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 1,
                                                  }}
                                                >
                                                  {task.endpoints.map(
                                                    (
                                                      endpoint: any,
                                                      endpointIndex: number
                                                    ) => (
                                                      <Box
                                                        key={endpointIndex}
                                                        sx={{
                                                          p: 2,
                                                          bgcolor: "white",
                                                          borderRadius: 1,
                                                          border: "1px solid",
                                                          borderColor:
                                                            "grey.300",
                                                        }}
                                                      >
                                                        <Box
                                                          sx={{
                                                            display: "flex",
                                                            alignItems:
                                                              "center",
                                                            gap: 1,
                                                            mb: 1,
                                                          }}
                                                        >
                                                          <Chip
                                                            label={
                                                              endpoint.method ||
                                                              "GET"
                                                            }
                                                            size="small"
                                                            color={
                                                              endpoint.method ===
                                                              "POST"
                                                                ? "success"
                                                                : endpoint.method ===
                                                                    "PUT" ||
                                                                  endpoint.method ===
                                                                    "PATCH"
                                                                ? "warning"
                                                                : endpoint.method ===
                                                                  "DELETE"
                                                                ? "error"
                                                                : "info"
                                                            }
                                                          />
                                                          <Typography
                                                            variant="body2"
                                                            fontFamily="monospace"
                                                            fontWeight="bold"
                                                          >
                                                            {endpoint.path ||
                                                              endpoint.url ||
                                                              "/"}
                                                          </Typography>
                                                        </Box>
                                                        {endpoint.description && (
                                                          <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                          >
                                                            {
                                                              endpoint.description
                                                            }
                                                          </Typography>
                                                        )}
                                                      </Box>
                                                    )
                                                  )}
                                                </Box>
                                              </Box>
                                            )}
                                        </CardContent>
                                      </Card>
                                    )
                                  )}
                                </Box>
                              </Box>
                            )}
                        </Box>
                      )}
                  </CardContent>
                </Card>

                {(!selectedDraft.latest_project_json ||
                  Object.keys(selectedDraft.latest_project_json).length ===
                    0) && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Project Structure
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        AI-generated project structure and files will be shown
                        here based on the selected category (
                        {selectedDraft.category}) and difficulty level (
                        {selectedDraft.difficulty_level}).
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </Box>

          {/* Completed Draft Notice */}
          {selectedDraft && selectedDraft.status === "completed" && (
            <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              <Alert severity="info" icon={<HistoryIcon />}>
                This project has been completed and can no longer be modified.
                It's now available as a historical record.
              </Alert>
            </Box>
          )}

          {/* Refine Input Area */}
          {selectedDraft &&
            selectedDraft.status !== "generating" &&
            selectedDraft.status !== "completed" && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                <Typography variant="subtitle2" gutterBottom>
                  <RefineIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Refine this project with AI
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Tell the AI what changes you'd like to make to this project..."
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                    disabled={isLoading || isPolling}
                  />
                  <Button
                    variant="contained"
                    onClick={handleRefineDraft}
                    disabled={!refinePrompt.trim() || isLoading || isPolling}
                    startIcon={<SendIcon />}
                    sx={{
                      bgcolor: "primary.main",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                      "&:disabled": {
                        bgcolor: "grey.300",
                        color: "grey.500",
                      },
                      px: 3,
                    }}
                  >
                    {isLoading ? "Refining..." : "Refine"}
                  </Button>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Press Enter to send, Shift + Enter for new line. Describe
                  changes, improvements, or new requirements for your project.
                </Typography>
              </Box>
            )}
        </Paper>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleOpenEditDialog}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Info
        </MenuItem>
        <MenuItem onClick={handleDeleteDraft} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <CreateDraftDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateDraft}
        loading={isLoading}
      />

      <EditDraftDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleEditDraft}
        loading={isLoading}
        initialData={
          selectedDraftForMenu
            ? {
                name:
                  drafts.find((d) => d.id === selectedDraftForMenu)?.name || "",
                is_public:
                  drafts.find((d) => d.id === selectedDraftForMenu)
                    ?.is_public || false,
              }
            : undefined
        }
      />
    </Container>
  );
};

export default AIProjectDrafts;
