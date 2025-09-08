import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Link,
  CircularProgress,
  Container,
  Avatar,
  Alert,
} from "@mui/material";
import {
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

export default function LoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Your actual login logic here
      // For now, simulating login process
      if (
        credentials.username === "admin@socialroots.ai" &&
        credentials.password === "Admin@123"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        navigate("/tests");
      } else {
        setError("Invalid username or password");
        setIsLoading(false);
      }
      // On successful login, navigate to tests page
    } catch (err) {
      setError("Invalid username or password");
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Header */}
          <Avatar
            sx={{
              m: 1,
              bgcolor: "primary.main",
              width: 64,
              height: 64,
              mb: 3,
            }}
          >
            <LockIcon sx={{ fontSize: 20 }} />
          </Avatar>

          <Typography
            component="h1"
            variant="h5"
            gutterBottom
            sx={{
              color: "black",
              fontWeight: 300,
              textAlign: "center",
            }}
          >
            Regression Testing
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "black",
              mb: 4,
              textAlign: "center",
            }}
          >
            Sign in to access your test suite
          </Typography>

          {/* Login Card */}
          <Paper
            elevation={8}
            sx={{
              p: 4,
              width: "100%",
              maxWidth: 400,
              borderRadius: 3,
            }}
          >
            <Box component="form" onSubmit={handleLogin}>
              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Username Field */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={credentials.username}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Password Field */}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              {/* Remember Me & Forgot Password */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
                <Link
                  href="#"
                  variant="body2"
                  color="primary"
                  sx={{ textDecoration: "none" }}
                >
                  Forgot password?
                </Link>
              </Box>

              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
                sx={{
                  mt: 1,
                  mb: 2,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 500,
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Divider */}
              <Box
                sx={{
                  mt: 4,
                  pt: 3,
                  borderTop: 1,
                  borderColor: "divider",
                  textAlign: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Need help?{" "}
                  <Link
                    href="#"
                    color="primary"
                    sx={{ textDecoration: "none" }}
                  >
                    Contact support
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.6)",
              mt: 4,
              textAlign: "center",
            }}
          >
            © 2024 Regression Testing Suite. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
