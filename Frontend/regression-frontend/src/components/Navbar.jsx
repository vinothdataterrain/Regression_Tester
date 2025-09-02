import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  AccountCircle,
  Logout,
  Settings,
  BugReport as TestIcon,
  Person
} from "@mui/icons-material";
import { useState } from "react";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  return (
    <Box sx={{ flexGrow: 1, width: "100%" }}>
      <AppBar
        position="static"
        elevation={1}
        sx={{ bgcolor: "white", color: "text.primary" }}
      >
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Avatar
              sx={{ bgcolor: "primary.main", mr: 2, width: 40, height: 40 }}
            >
              <TestIcon />
            </Avatar>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Playwright Testing Suite
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ textAlign: "right", mr: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "text.primary" }}
              >
                User Name
              </Typography>
              <Typography variant="caption" color="text.secondary">
                user@gmail.com
              </Typography>
            </Box>
            <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
             <Person />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleMenuClose}>
                <AccountCircle sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Settings sx={{ mr: 1 }} /> Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleMenuClose}>
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
