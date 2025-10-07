import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { useLoginMutation } from "../services/login.api.services";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUserdata } from "../features/userSlice";
import { jwtDecode } from "jwt-decode";
import { resetUserInfo } from "../services/loginInfo";
import { useForm } from "react-hook-form";
import SuccessGradientMessage from "../components/successPopup";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const RedirectPath =
    new URLSearchParams(location.search).get("redirect") || "/dashboard";
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const { reset } = useForm();
  const [isBackdropOpen, setIsBackdropOpen] = useState(false);

  const [
    loginUser,
    {
      isSuccess: isLoginSuccess,
      isError: isLoginError,
      error: LoginError,
      isLoading: isLoading,
    },
  ] = useLoginMutation();

  useEffect(() => {
    if (isLoginSuccess) {
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken);
          if (decoded.username && decoded.email) {
            dispatch(
              setUserdata({
                username: decoded.username,
                email: decoded.email,
                user_id: decoded.user_id,
              })
            );
          }
        } catch (error) {
          console.error("Error decoding access token:", error);
        }
      }
      setIsBackdropOpen(true);
      setTimeout(() => {
        setIsBackdropOpen(false);
        navigate(RedirectPath);
      }, 3000);
    }
    if (isLoginError) {
      toast.error(LoginError?.data?.detail || "Failed to login");
    }
  }, [
    isLoginSuccess,
    isLoginError,
    LoginError,
    dispatch,
    navigate,
    RedirectPath,
  ]);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    dispatch(resetUserInfo());
    if (localStorage.getItem("rememberMe") === "true") {
      setRememberMe(true);
      setCredentials((prev) => ({ ...prev, username, password : atob(password) }));
      reset({ username, password : atob(password) });
    }
  }, []);

  const handleRememberMe = () => {
    localStorage.setItem("rememberMe", !rememberMe);
    setRememberMe(!rememberMe);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleLogin = async () => {
    setError("");

    if (localStorage.getItem("rememberMe") === "true") {
      localStorage.setItem("username", credentials.username);
      localStorage.setItem("password",btoa(credentials.password));
    }

    try {
      const LoginData = {
        username: credentials.username,
        password: credentials.password,
      };
      await loginUser(LoginData);
    } catch (err) {
      console.error("failed to login", err);
      setError("Invalid username or password" + err);
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
            <Box component="form">
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
                      onChange={handleRememberMe}
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
                onClick={() => handleLogin()}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <Typography className="text-center">{"OR"}</Typography>
              <Box display="flex" justifyContent="center">
                <Button
                  sx={{
                    alignItems: "center",
                    mt: 1,
                  }}
                  onClick={() => navigate("/signUp")}
                >
                  {"Sign Up"}
                </Button>
              </Box>

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
      <SuccessGradientMessage
        isBackdropOpen={isBackdropOpen}
        message={"Successfully Logged in!!"}
      />
    </Box>
  );
}
