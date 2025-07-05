import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import Login from "./pages/Users/Login";
import SignUp from "./pages/Users/SignUp";
import Profile from "./pages/Users/Profile";
import Projects from "./pages/Projects/Projects";
import ProjectDetail from "./pages/Projects/ProjectDetail";
import TaskDetail from "./pages/TaskDetail";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./utils/ProtectedRoute";
import { useThemeStore } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";
import NotFound from "./pages/NotFound";
import { PublicRoute } from "./utils/PublicRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CertificateDetails from "./pages/Certificates/CertificateDetails";
import OAuthCallback from "./pages/Users/OAuthCallback";
import Home from "./pages/Home";
import { darkPalette, lightPalette } from "./theme/palette";
import Teams from "./pages/Teams/Teams";
import TeamDetail from "./pages/Teams/TeamDetail";
import AcceptInvitation from "./pages/Teams/AcceptInvitation";
import ProjectSubmissions from "./pages/Projects/ProjectSubmissions";

import AIProjectDrafts from "./pages/Projects/AIProjectDrafts";
import Certificates from "./pages/Certificates/Certificates";
import Pricing from "./pages/Pricing";


// Public routes that don't require authentication
const publicRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/oauth/callback",
    element: <OAuthCallback />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/teams/:team_uuid/invitations/:pk/accept",
    element: <AcceptInvitation />,
  },
];

// Protected routes that require authentication
const protectedRoutes = [
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/projects",
    element: <Projects />,
  },
  {
    path: "/projects/:id",
    element: <ProjectDetail />,
  },
  {
    path: "/projects/:projectId/tasks/:taskId",
    element: <TaskDetail />,
  },
  {
    path: "/certificates",
    element: <Certificates />,
  },
  {
    path: "/certificates/:certificate_no",
    element: <CertificateDetails />,
  },
  {
    path: "/teams",
    element: <Teams />,
  },
  {
    path: "/teams/:uuid",
    element: <TeamDetail />,
  },
  {
    path: "/projects/:projectId/submissions",
    element: <ProjectSubmissions />,
  },
  {
    path: "/projects/:projectId/tasks/:taskId/submissions",
    element: <ProjectSubmissions />,
  },
  
  {
    path: "/projects/drafts",
    element: <AIProjectDrafts />,
  },
  // Add more protected routes here
  // Example:
  // {
  //   path: "/profile",
  //   element: <Profile />,
  // },
];

// Component to handle public routes

function App() {
  const { darkMode, toggleDarkMode } = useThemeStore();
  const palette = darkMode ? darkPalette : lightPalette;
  const theme = createTheme({
    palette,
  });

  const queryClient = new QueryClient();

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <Router>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Navbar darkMode={darkMode} onDarkModeToggle={toggleDarkMode} />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Public Routes */}
                {publicRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<PublicRoute>{route.element}</PublicRoute>}
                  />
                ))}

                {/* Protected Routes */}
                {protectedRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<ProtectedRoute>{route.element}</ProtectedRoute>}
                  />
                ))}

                {/* Catch all route - redirect to NotFound */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
