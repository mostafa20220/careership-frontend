import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Link,
  CircularProgress,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useSignup } from "../../hooks/useAuth";
import OAuthButtons from "../../components/OAuthButtons";

interface ValidationErrors {
  [key: string]: string[];
}

export default function SignUp() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [oauthError, setOauthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const signupMutation = useSignup();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setOauthError(null);

    if (formData.password !== formData.confirmPassword) {
      setErrors({
        confirmPassword: ["Passwords do not match"],
      });
      return;
    }

    try {
      const { confirmPassword, ...signupData } = formData;
      await signupMutation.mutateAsync(signupData);
      navigate("/");
    } catch (err: any) {
      console.log("Full error:", err);
      console.log("Error response:", err?.response);
      console.log("Error data:", err?.response?.data);
      console.log("Error message:", err?.message);

      // Check if error has the concatenated format from useAuth
      if (err?.message && typeof err.message === "string") {
        const validationErrors: ValidationErrors = {};

        // Parse the concatenated error message like "password: msg1, msg2\nfield: msg3"
        const errorLines = err.message.split("\n");
        errorLines.forEach((line: string) => {
          const colonIndex = line.indexOf(":");
          if (colonIndex > 0) {
            const field = line.substring(0, colonIndex).trim();
            const messagesStr = line.substring(colonIndex + 1).trim();
            const messages = messagesStr
              .split(", ")
              .map((msg: string) => msg.trim());
            validationErrors[field] = messages;
          }
        });

        console.log("Parsed validation errors:", validationErrors);

        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      }

      // Fallback: check if it's a structured response error
      const errorData = err?.response?.data;
      if (errorData && typeof errorData === "object") {
        const validationErrors: ValidationErrors = {};

        // Process each field's errors
        Object.entries(errorData).forEach(([field, messages]) => {
          console.log(`Processing field: ${field}, messages:`, messages);
          if (Array.isArray(messages)) {
            validationErrors[field] = messages;
          } else if (typeof messages === "string") {
            validationErrors[field] = [messages];
          }
        });

        console.log("Final validation errors:", validationErrors);

        // Set validation errors if any exist
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
        } else {
          // Fallback to a general error message
          setErrors({
            general: ["An unexpected error occurred. Please try again."],
          });
        }
      } else {
        setErrors({
          general: ["An unexpected error occurred. Please try again."],
        });
      }
    }
  };

  const handleOAuthSuccess = () => {
    setOauthError(null);
    navigate("/"); // Redirect to home page after successful OAuth signup
  };

  const handleOAuthError = (error: string) => {
    setOauthError(error);
  };

  const getFieldError = (fieldName: string) => {
    const fieldErrors = errors[fieldName];
    console.log(`Getting field error for ${fieldName}:`, fieldErrors);
    return fieldErrors?.join("\n") || "";
  };

  const getAllErrors = () => {
    console.log("Getting all errors from state:", errors);
    const allErrors = Object.entries(errors).flatMap(([field, msgs]) => {
      if (!msgs || msgs.length === 0) return [];

      if (
        field === "password" ||
        field === "confirmPassword" ||
        field === "general"
      ) {
        return msgs; // Show these errors as plain messages
      } else {
        return msgs.map((msg) => `${field}: ${msg}`);
      }
    });
    console.log("All errors to display:", allErrors);
    return allErrors;
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          {/* Show all validation errors in an Alert above the form */}
          {getAllErrors().length > 0 && (
            <Alert severity="error" sx={{ width: "100%", mt: 2, mb: 2 }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {getAllErrors().map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </Alert>
          )}
          {(signupMutation.error || oauthError) &&
            !Object.keys(errors).length && (
              <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
                {oauthError || signupMutation.error?.message}
              </Alert>
            )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="first_name"
              label="First Name"
              name="first_name"
              autoComplete="given-name"
              autoFocus
              value={formData.first_name}
              onChange={handleChange}
              error={!!getFieldError("first_name")}
              helperText={getFieldError("first_name")}
              disabled={signupMutation.isPending}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="last_name"
              label="Last Name"
              name="last_name"
              autoComplete="family-name"
              value={formData.last_name}
              onChange={handleChange}
              error={!!getFieldError("last_name")}
              helperText={getFieldError("last_name")}
              disabled={signupMutation.isPending}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!getFieldError("email")}
              helperText={getFieldError("email")}
              disabled={signupMutation.isPending}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors["password"]}
              helperText={getFieldError("password")}
              disabled={signupMutation.isPending}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors["confirmPassword"]}
              helperText={getFieldError("confirmPassword")}
              disabled={signupMutation.isPending}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign Up"
              )}
            </Button>

            <OAuthButtons
              onSuccess={handleOAuthSuccess}
              onError={handleOAuthError}
            />

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
