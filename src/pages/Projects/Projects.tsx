import { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Alert,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";
import { SmartToy as AIIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import type { Project, Category, Difficulty } from "../../types/project";
import ProjectCard from "../../components/ProjectCard";
import api, { fetchCategories, fetchDifficulties } from "../../services/api";

const PAGE_SIZE = 10;

export default function Projects() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [premium, setPremium] = useState("");
  const [visibility, setVisibility] = useState("");
  const [registered, setRegistered] = useState("");
  const navigate = useNavigate();

  // Clear all filters
  const clearFilters = () => {
    setDifficulty("");
    setCategory("");
    setPremium("");
    setVisibility("");
    setRegistered("");
    setPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    difficulty || category || premium || visibility || registered;

  // Filter projects locally
  const filteredProjects = allProjects.filter((project) => {
    if (difficulty && project.difficulty_level !== difficulty) return false;
    if (category && project.category !== category) return false;
    if (premium === "true" && !project.is_premium) return false;
    if (premium === "false" && project.is_premium) return false;
    if (visibility === "true" && !project.is_public) return false;
    if (visibility === "false" && project.is_public) return false;
    if (registered === "true" && !project.is_registered) return false;
    if (registered === "false" && project.is_registered) return false;
    return true;
  });

  // Pagination for filtered results
  const totalPages = Math.ceil(filteredProjects.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

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
    setPage(1); // Reset page when filters change
  }, [difficulty, category, premium, visibility, registered]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch all projects without pagination for local filtering
    api
      .get("/projects/")
      .then((res) => {
        setAllProjects(res.data.results);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load projects");
        setLoading(false);
      });
  }, []);

  // will be displayed when the page is loading
  const renderSkeletonCards = () => (
    <Grid container spacing={3}>
      {[...Array(PAGE_SIZE)].map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="80%" height={20} />
              <Box sx={{ mt: 2 }}>
                <Skeleton variant="rectangular" width="60%" height={24} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Projects
        </Typography>
        {renderSkeletonCards()}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            mb: 2,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              label="Difficulty"
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {difficulties.map((diff) => (
                <MenuItem key={diff.id} value={diff.name}>
                  {diff.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={premium}
              label="Type"
              onChange={(e) => setPremium(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Premium</MenuItem>
              <MenuItem value="false">Free</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Visibility</InputLabel>
            <Select
              value={visibility}
              label="Visibility"
              onChange={(e) => setVisibility(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Public</MenuItem>
              <MenuItem value="false">Private</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Registration</InputLabel>
            <Select
              value={registered}
              label="Registration"
              onChange={(e) => setRegistered(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Registered</MenuItem>
              <MenuItem value="false">Not Registered</MenuItem>
            </Select>
          </FormControl>
          {hasActiveFilters && (
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={clearFilters}
              sx={{ minWidth: 120, height: 40 }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Explore Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover amazing projects and start your next adventure
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AIIcon />}
            onClick={() => navigate("/projects/drafts")}
            sx={{
              bgcolor: "primary.main",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              px: 3,
              py: 1,
            }}
          >
            AI Project Drafts
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {paginatedProjects?.map((project: Project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </Grid>

      {paginatedProjects?.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {hasActiveFilters
              ? "No projects match your filters"
              : "No projects available"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hasActiveFilters
              ? "Try adjusting your filters"
              : "Check back later for new projects"}
          </Typography>
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}
