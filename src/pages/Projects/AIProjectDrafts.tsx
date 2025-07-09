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
import type { Category, Difficulty } from "../../types/project";
import { fetchCategories, fetchDifficulties } from "../../services/api";

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
        width: "100%",
        maxWidth: 600,
        height: 350,
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Animated background pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 25% 25%, rgba(25, 118, 210, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(25, 118, 210, 0.1) 0%, transparent 50%)",
          animation: "bgShift 4s ease-in-out infinite alternate",
          "@keyframes bgShift": {
            "0%": {
              transform: "rotate(0deg) scale(1)",
            },
            "100%": {
              transform: "rotate(2deg) scale(1.02)",
            },
          },
        }}
      />

      {/* Flowing energy lines */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: "-100%",
          right: 0,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.2), rgba(25, 118, 210, 0.4), rgba(25, 118, 210, 0.2), transparent)",
          animation: "energyFlow 3s ease-in-out infinite",
          "@keyframes energyFlow": {
            "0%": {
              transform: "translateX(0%)",
              opacity: 0,
            },
            "50%": {
              transform: "translateX(50%)",
              opacity: 1,
            },
            "100%": {
              transform: "translateX(200%)",
              opacity: 0,
            },
          },
        }}
      />

      {/* Main content */}
      <Box
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 1,
          p: 4,
        }}
      >
        {/* AI Brain Icon with pulsing effect */}
        <Box
          sx={{
            position: "relative",
            mb: 3,
          }}
        >
          <LightningIcon
            sx={{
              fontSize: 80,
              color: "primary.main",
              animation: "brainPulse 2s ease-in-out infinite",
              "@keyframes brainPulse": {
                "0%": { opacity: 0.6, transform: "scale(1)" },
                "50%": { opacity: 1, transform: "scale(1.1)" },
                "100%": { opacity: 0.6, transform: "scale(1)" },
              },
            }}
          />

          {/* Orbiting particles */}
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "primary.main",
                animation: `orbit${i} 3s linear infinite`,
                transformOrigin: "0 0",
                [`@keyframes orbit${i}`]: {
                  "0%": {
                    transform: `translate(-50%, -50%) rotate(${
                      i * 120
                    }deg) translateX(50px) rotate(-${i * 120}deg)`,
                  },
                  "100%": {
                    transform: `translate(-50%, -50%) rotate(${
                      i * 120 + 360
                    }deg) translateX(50px) rotate(-${i * 120 + 360}deg)`,
                  },
                },
              }}
            />
          ))}
        </Box>

        <Typography
          variant="h5"
          color="primary"
          gutterBottom
          fontWeight="bold"
          sx={{
            background: "linear-gradient(45deg, #1976d2, #42a5f5)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AI is generating your project...
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: 400,
            lineHeight: 1.6,
            opacity: 0.8,
          }}
        >
          Our advanced AI is crafting a personalized project structure, tasks,
          and documentation tailored specifically for you. This magical process
          will be worth the wait!
        </Typography>

        {/* Progress indicator */}
        <Box sx={{ mt: 3, width: "80%", maxWidth: 300 }}>
          <Box
            sx={{
              height: 4,
              bgcolor: "grey.200",
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                height: "100%",
                background: "linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)",
                backgroundSize: "200% 100%",
                animation: "progressShimmer 2s ease-in-out infinite",
                "@keyframes progressShimmer": {
                  "0%": { backgroundPosition: "-200% 0" },
                  "100%": { backgroundPosition: "200% 0" },
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const CreateDraftDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDraftFormData) => void;
  loading: boolean;
  categories: Category[];
  difficulties: Difficulty[];
}> = ({ open, onClose, onSubmit, loading, categories, difficulties }) => {
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
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
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
              {difficulties.map((difficulty) => (
                <MenuItem key={difficulty.id} value={difficulty.name}>
                  {difficulty.name}
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");

  const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId);

  // Filter and sort drafts
  const filteredAndSortedDrafts = React.useMemo(() => {
    let filtered = drafts.filter((draft) => {
      // Status filter
      if (statusFilter !== "all" && draft.status !== statusFilter) {
        return false;
      }

      // Visibility filter
      if (visibilityFilter === "public" && !draft.is_public) {
        return false;
      }
      if (visibilityFilter === "private" && draft.is_public) {
        return false;
      }

      return true;
    });

    // Sort: completed drafts at the end, then by creation date (latest first)
    return filtered.sort((a, b) => {
      // First, separate completed from non-completed
      if (a.status === "completed" && b.status !== "completed") {
        return 1; // a goes after b
      }
      if (a.status !== "completed" && b.status === "completed") {
        return -1; // a goes before b
      }

      // Within the same completion status, sort by creation date (latest first)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [drafts, statusFilter, visibilityFilter]);

  // Fetch categories and difficulties on component mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesRes, difficultiesRes] = await Promise.all([
          fetchCategories(),
          fetchDifficulties(),
        ]);
        setCategories(categoriesRes.data);
        setDifficulties(difficultiesRes.data);
      } catch (error) {
        console.error("Failed to load filters:", error);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    fetchDrafts();
    // Cleanup polling on unmount
    return () => {
      stopPollingDraft();
    };
  }, [fetchDrafts, stopPollingDraft]);

  const handleCreateDraft = async (formData: CreateDraftFormData) => {
    try {
      // Find category and difficulty IDs based on selected names
      const selectedCategory = categories.find(
        (cat) => cat.name === formData.category
      );
      const selectedDifficulty = difficulties.find(
        (diff) => diff.name === formData.difficulty
      );

      if (!selectedCategory || !selectedDifficulty) {
        console.error("Invalid category or difficulty selection");
        return;
      }

      const payload: CreateProjectDraftRequest = {
        name: formData.name || undefined,
        category_id: selectedCategory.id,
        difficulty_level_id: selectedDifficulty.id,
        is_public: formData.isPublic,
      };

      console.log("Creating draft with payload:", payload);
      console.log("Form data category:", formData.category);
      console.log("Mapped category_id:", selectedCategory.id);

      await createDraft(payload);
      setCreateDialogOpen(false);

      // Auto-select the newly created draft by fetching the updated list
      // and selecting the most recent one
      await fetchDrafts();
      // The store should handle selecting the new draft automatically
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
        // The draft should stay in the list but be marked as completed
        // Refresh the drafts list to get the updated status
        await fetchDrafts();
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
    <Container
      maxWidth={false}
      sx={{ height: "calc(100vh - 100px)", py: 2, px: 1 }}
    >
      <Box sx={{ display: "flex", height: "100%", gap: 2, maxWidth: "100vw" }}>
        {/* Left Sidebar - Drafts List */}
        <Paper
          elevation={2}
          sx={{
            width: 280,
            minWidth: 280,
            maxWidth: 280,
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
              <Chip
                label={`${filteredAndSortedDrafts.length} Drafts`}
                size="small"
              />
            </Box>

            {/* Filters */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="generating">Generating</MenuItem>
                  <MenuItem value="pending_review">Pending Review</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Visibility</InputLabel>
                <Select
                  value={visibilityFilter}
                  label="Visibility"
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Drafts List */}
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            {isLoading ? (
              <DraftSkeleton />
            ) : (
              <List disablePadding>
                {filteredAndSortedDrafts.map((draft) => (
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
                        ...(draft.status === "completed" && {
                          bgcolor: "grey.50",
                          "&:hover": {
                            bgcolor: "grey.100",
                          },
                        }),
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  selectedDraftId === draft.id ? 600 : 400,
                                ...(draft.status === "completed" && {
                                  color: "text.secondary",
                                  textDecoration: "none",
                                }),
                              }}
                            >
                              {draft.name || "Untitled Project"}
                            </Typography>
                            {draft.status === "completed" && (
                              <Chip
                                label="Completed"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem", height: 20 }}
                              />
                            )}
                          </Box>
                        }
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
                        {draft.status === "completed" ? (
                          <HistoryIcon fontSize="small" color="success" />
                        ) : draft.is_public ? (
                          <PublicIcon fontSize="small" color="primary" />
                        ) : (
                          <PrivateIcon fontSize="small" color="action" />
                        )}
                        {draft.status !== "completed" && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenMenu(e, draft.id)}
                            sx={{ p: 0.5 }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}

            {filteredAndSortedDrafts.length === 0 && !isLoading && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <AIIcon sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {drafts.length === 0
                    ? "No drafts yet. Create your first AI project!"
                    : "No drafts match the current filters."}
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
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: 40,
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
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
                  </Box>
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
                  gap: 3,
                  px: 4,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    animation: "float 3s ease-in-out infinite",
                    "@keyframes float": {
                      "0%": { transform: "translateY(0px)" },
                      "50%": { transform: "translateY(-10px)" },
                      "100%": { transform: "translateY(0px)" },
                    },
                  }}
                >
                  <AIIcon
                    sx={{ fontSize: 120, color: "primary.main", opacity: 0.7 }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "sparkle 2s ease-in-out infinite",
                      "@keyframes sparkle": {
                        "0%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
                        "50%": { opacity: 1, transform: "scale(1.2)" },
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: 20 }}>✨</Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: "center", maxWidth: 480 }}>
                  <Typography
                    variant="h4"
                    color="primary"
                    gutterBottom
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                  >
                    Welcome to AI Project Generator!
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 3, fontWeight: 400 }}
                  >
                    Ready to create something amazing? Let our AI help you build
                    your next project!
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, lineHeight: 1.6 }}
                  >
                    🚀 Select a draft from the sidebar to view details, or click
                    the <strong>+</strong> button to create your first
                    AI-generated project. Our intelligent system will create a
                    complete project structure, tasks, and documentation
                    tailored to your needs.
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 2,
                      flexWrap: "wrap",
                      mt: 3,
                    }}
                  >
                    <Chip
                      icon={<CodeIcon />}
                      label="Smart Code Structure"
                      color="primary"
                      variant="outlined"
                      sx={{ fontSize: "0.875rem", py: 2 }}
                    />
                    <Chip
                      icon={<TaskIcon />}
                      label="Detailed Task Breakdown"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontSize: "0.875rem", py: 2 }}
                    />
                    <Chip
                      icon={<AIIcon />}
                      label="AI-Powered Generation"
                      color="success"
                      variant="outlined"
                      sx={{ fontSize: "0.875rem", py: 2 }}
                    />
                  </Box>
                </Box>
              </Box>
            ) : selectedDraft.status === "generating" ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  minHeight: "60vh",
                }}
              >
                <GeneratingLoadingIndicator />
              </Box>
            ) : isLoading ? (
              <ProjectContentSkeleton />
            ) : (
              <Box>
                {/* Check if we have actual project content */}
                {selectedDraft?.latest_project_json &&
                Object.keys(selectedDraft.latest_project_json).length > 0 ? (
                  // Show generated project content
                  <Box>
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
                          <CodeIcon color="primary" sx={{ fontSize: 28 }} />
                          <Typography
                            variant="h5"
                            color="primary.main"
                            fontWeight="bold"
                          >
                            {selectedDraft.latest_project_json.name}
                          </Typography>
                        </Box>

                        {selectedDraft.latest_project_json.description && (
                          <Typography
                            variant="body1"
                            color="text.primary"
                            paragraph
                          >
                            {selectedDraft.latest_project_json.description}
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
                              label={selectedDraft.latest_project_json.category}
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
                          {selectedDraft.latest_project_json.max_team_size && (
                            <Chip
                              label={`Team Size: ${selectedDraft.latest_project_json.max_team_size}`}
                              variant="outlined"
                            />
                          )}
                          {selectedDraft.latest_project_json.is_premium !==
                            undefined && (
                            <Chip
                              label={
                                selectedDraft.latest_project_json.is_premium
                                  ? "Premium"
                                  : "Free"
                              }
                              color={
                                selectedDraft.latest_project_json.is_premium
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
                            <TaskIcon color="action" sx={{ fontSize: 28 }} />
                            <Typography variant="h5" fontWeight="bold">
                              Project Tasks (
                              {selectedDraft.latest_project_json.tasks.length})
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
                                            task.duration_in_days > 1 ? "s" : ""
                                          }`}
                                          size="small"
                                          color="info"
                                          variant="outlined"
                                        />
                                      )}
                                      {task.order !== undefined && (
                                        <Chip
                                          label={`Order: ${task.order + 1}`}
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
                                                    borderColor: "grey.300",
                                                  }}
                                                >
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      gap: 1,
                                                      mb: 1,
                                                    }}
                                                  >
                                                    <Chip
                                                      label={
                                                        endpoint.method || "GET"
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
                                                      {endpoint.description}
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
                ) : (
                  // Show empty state for drafts with no content
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "60vh",
                      flexDirection: "column",
                      gap: 3,
                      px: 4,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        animation: "bounce 2s ease-in-out infinite",
                        "@keyframes bounce": {
                          "0%, 20%, 50%, 80%, 100%": {
                            transform: "translateY(0)",
                          },
                          "40%": { transform: "translateY(-10px)" },
                          "60%": { transform: "translateY(-5px)" },
                        },
                      }}
                    >
                      <AIIcon
                        sx={{
                          fontSize: 100,
                          color: "primary.main",
                          opacity: 0.6,
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: -5,
                          right: -5,
                          animation: "pulse 1.5s ease-in-out infinite",
                          "@keyframes pulse": {
                            "0%": { opacity: 0.4, transform: "scale(1)" },
                            "50%": { opacity: 1, transform: "scale(1.1)" },
                            "100%": { opacity: 0.4, transform: "scale(1)" },
                          },
                        }}
                      >
                        <Typography sx={{ fontSize: 24 }}>⚡</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ maxWidth: 500 }}>
                      <Typography
                        variant="h5"
                        color="primary"
                        gutterBottom
                        fontWeight="bold"
                      >
                        AI is Ready to Generate!
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 3, lineHeight: 1.7 }}
                      >
                        This draft is waiting for AI magic! ✨ Use the{" "}
                        <strong>refine input</strong> below to describe what you
                        want to build, or ask for specific improvements. Our AI
                        will generate a complete project structure, tasks, and
                        documentation based on your selected category (
                        <strong>{selectedDraft?.category}</strong>) and
                        difficulty level (
                        <strong>{selectedDraft?.difficulty_level}</strong>).
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          icon={<CodeIcon />}
                          label="Project Structure"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: "0.875rem" }}
                        />
                        <Chip
                          icon={<TaskIcon />}
                          label="Task Breakdown"
                          color="secondary"
                          variant="outlined"
                          sx={{ fontSize: "0.875rem" }}
                        />
                        <Chip
                          icon={<AIIcon />}
                          label="AI Documentation"
                          color="info"
                          variant="outlined"
                          sx={{ fontSize: "0.875rem" }}
                        />
                      </Box>
                    </Box>
                  </Box>
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
                    placeholder="Tell the AI what changes you'd like to make to this project (minimum 10 characters)..."
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                    disabled={isLoading || isPolling}
                    error={
                      refinePrompt.length > 0 && refinePrompt.trim().length < 10
                    }
                    helperText={
                      refinePrompt.length > 0 && refinePrompt.trim().length < 10
                        ? `Please enter at least 10 characters (${
                            refinePrompt.trim().length
                          }/10)`
                        : ""
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={handleRefineDraft}
                    disabled={
                      !refinePrompt.trim() ||
                      refinePrompt.trim().length < 10 ||
                      isLoading ||
                      isPolling
                    }
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
        categories={categories}
        difficulties={difficulties}
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
