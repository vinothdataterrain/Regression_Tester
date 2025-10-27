import React, { useEffect, useState } from "react";
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
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useCreateUserMutation } from "../services/login.api.services";
import { toast } from "react-toastify";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const [
    createUser,
    {
      isSuccess: isRegistrationSuccess,
      isError: isRegistrationError,
      error: RegistrationError,
    },
  ] = useCreateUserMutation();

  useEffect(() => {
    if (isRegistrationSuccess) {
      toast.success("User created successfully!!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
    if (isRegistrationError) {
      toast.error(RegistrationError || "Failed to create user");
    }
  }, [isRegistrationSuccess, isRegistrationError, RegistrationError]);

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Terms agreement validation
    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const SignupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };
      await createUser(SignupData).unwrap();
    } catch (error) {
      console.error("Failed to create user", error);
      setErrors({ submit: "Failed to create account. Please try again." });
    } finally {
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
            <PersonAddIcon sx={{ fontSize: 20 }} />
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
            Test Automator
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "black",
              mb: 4,
              textAlign: "center",
            }}
          >
            Create your account
          </Typography>

          {/* SignUp Card */}
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
                value={formData.username}
                onChange={handleInputChange}
                error={!!errors.username}
                helperText={errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Email Field */}
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
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
                sx={{ mb: 2 }}
              />

              {/* Terms and Conditions */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{" "}
                      <Link
                        href="#"
                        color="primary"
                        sx={{ textDecoration: "none" }}
                      >
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="#"
                        color="primary"
                        sx={{ textDecoration: "none" }}
                      >
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
                {errors.terms && (
                  <Typography variant="caption" color="error" sx={{ ml: 4 }}>
                    {errors.terms}
                  </Typography>
                )}
              </Box>

              {/* SignUp Button */}
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
                onClick={() => handleSignUp()}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <Typography className="text-center">{"OR"}</Typography>
              <Box display="flex" justifyContent="center">
                <Button
                  sx={{
                    alignItems: "center",
                    mt: 1,
                  }}
                  onClick={() => navigate("/login")}
                >
                  {"Already have an account? Login"}
                </Button>
              </Box>

              {/* Divider */}
              {/* <Box
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
              </Box> */}
            </Box>
          </Paper>

          {/* Footer */}
          {/* <Typography
            variant="caption"
            sx={{
              color: "rgba(0,0,0,0.6)",
              mt: 4,
              textAlign: "center",
            }}
          >
            © 2024 Regression Testing Suite. All rights reserved.
          </Typography> */}
        </Box>
      </Container>
    </Box>
  );
}
