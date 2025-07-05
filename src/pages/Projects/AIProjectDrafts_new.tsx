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
} from "@mui/material";
import {
  Add as AddIcon,
  SmartToy as AIIcon,
  Edit as EditIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
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

const AIProjectDrafts: React.FC = () => {
  const {
    drafts,
    selectedDraftId,
    selectDraft,
    fetchDrafts,
    isLoading,
    error,
    createDraft,
  } = useAIProjectStore();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handleCreateDraft = async (formData: CreateDraftFormData) => {
    try {
      const payload: CreateProjectDraftRequest = {
        name: formData.name || undefined,
        category_id: CATEGORY_MAP[formData.category],
        difficulty_level_id: DIFFICULTY_MAP[formData.difficulty],
        is_public: formData.isPublic,
      };

      await createDraft(payload);
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create draft:", error);
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
                          <Box>
                            <Typography variant="caption" display="block">
                              {Object.keys(CATEGORY_MAP).find(
                                (key) => CATEGORY_MAP[key] === Number(draft.category)
                              )}
                              {" • "}
                              {Object.keys(DIFFICULTY_MAP).find(
                                (key) =>
                                  DIFFICULTY_MAP[key] === Number(draft.difficulty_level)
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(draft.created_at)}
                            </Typography>
                          </Box>
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
                        }}
                      >
                        {draft.is_public ? (
                          <PublicIcon fontSize="small" color="primary" />
                        ) : (
                          <PrivateIcon fontSize="small" color="action" />
                        )}
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
            <Typography variant="h6" color="primary">
              {selectedDraft?.name || "Select a draft"}
            </Typography>
            {selectedDraft && (
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Chip
                  label={Object.keys(CATEGORY_MAP).find(
                    (key) => CATEGORY_MAP[key] === Number(selectedDraft.category)
                  )}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={Object.keys(DIFFICULTY_MAP).find(
                    (key) =>
                      DIFFICULTY_MAP[key] === Number(selectedDraft.difficulty_level)
                  )}
                  size="small"
                  variant="outlined"
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

            {!selectedDraft ? (
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
                      This is where the AI-generated project content will be
                      displayed. The project details, structure, and
                      implementation guidelines will appear here once the AI
                      processes the draft requirements.
                    </Typography>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Project Structure
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI-generated project structure and files will be shown
                      here based on the selected category (
                      {Object.keys(CATEGORY_MAP).find(
                        (key) => CATEGORY_MAP[key] === Number(selectedDraft.category)
                      )}
                      ) and difficulty level (
                      {Object.keys(DIFFICULTY_MAP).find(
                        (key) =>
                          DIFFICULTY_MAP[key] === Number(selectedDraft.difficulty_level)
                      )}
                      ).
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      <CreateDraftDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateDraft}
        loading={isLoading}
      />
    </Container>
  );
};

export default AIProjectDrafts;
