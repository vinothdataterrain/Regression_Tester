import React, { useEffect, useState } from "react";
import {
  useCreateProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from "../services/runTestCases.api.services";
import { formatTableNullValues } from "../utils/constant";
import { DataGrid } from "@mui/x-data-grid";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Link as LinkIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import MoreIcon from "../assets/icons/moreiconRed.svg";
import ViewIcon from "../assets/images/view1x.png";
import { useNavigate } from "react-router-dom";

export default function Project() {
  const navigate = useNavigate();
  const [formattedRow, setFormattedRow] = useState(null);
  const [selectedItem, setSelectedItem] = useState({});
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [createProject] = useCreateProjectMutation();

  const [editProject] = useUpdateProjectMutation();

  const { data: projectsData } = useGetProjectsQuery();

  useEffect(() => {
    if (projectsData?.results) {
      const formattedData = formatTableNullValues(projectsData?.results);
      setFormattedRow(formattedData);
    }
  }, [projectsData]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMoreClick = (event, data) => {
    setSelectedItem(data);
    setAnchorEl(event.currentTarget);
  };

  const handleAddProject = async () => {
    if (
      !projectTitle.trim() ||
      !projectUrl.trim() ||
      !projectDescription.trim()
    )
      return;

    try {
      const ProjectData = {
        name: projectTitle,
        url: projectUrl,
        description: projectDescription,
      };
      await createProject(ProjectData);

      setProjectTitle("");
      setProjectUrl("");
      setProjectDescription("");
      setIsAddingProject(null);
      setSnackbar({
        open: true,
        message: "Project added successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleEditProject = async () => {
    if (
      !projectTitle.trim() ||
      !projectUrl.trim() ||
      !projectDescription.trim()
    )
      return;

    try {
      const ProjectData = {
        name: projectTitle,
        url: projectUrl,
        description: projectDescription,
      };
      await editProject({ id: projectId, data: ProjectData });

      setProjectTitle("");
      setProjectUrl("");
      setProjectDescription("");
      setIsEditingProject(null);
      setProjectId("");
      setSnackbar({
        open: true,
        message: "Project updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };
  console.log("currentid", projectId);

  const handleEditClick = () => {
    handleClose();
    setIsEditingProject(true);
    setProjectTitle(selectedItem.name);
    setProjectUrl(selectedItem.url);
    setProjectDescription(selectedItem.description);
    setProjectId(selectedItem.id);
  };

  const ProjectsTableColumn = [
    {
      field: "action",
      minWidth: 150,
      headerName: "Action",
      flex: 1,
      id: 4,

      headerAlign: "center",
      renderCell: (params) => {
        return (
          <>
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-all duration-300"
                onClick={(e) => handleMoreClick(e, params.row)}
              >
                <img src={MoreIcon} alt="MoreIcon" />
              </div>
            </div>
          </>
        );
      },
    },

    {
      field: "name",
      headerName: "Project Name",
      flex: 3,
      id: 2,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer flex justify-start items-center h-full w-full ">
            <span className="text-black">{params?.row?.name ?? "..."}</span>
          </div>
        );
      },
    },
    {
      field: "url",
      headerName: "Project URL",
      flex: 4,
      id: 3,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer flex justify-start items-center h-full w-full ">
            <span className="text-black">{params?.row?.url ?? "..."}</span>
          </div>
        );
      },
    },
    {
      field: "description",
      headerName: "Project Description",
      flex: 5,
      id: 4,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer flex justify-start items-center h-full w-full ">
            <span className="text-black">
              {params?.row?.description ?? "..."}
            </span>
          </div>
        );
      },
    },
    {
      field: "testcasesLength",
      headerName: "Number of Testcases",
      flex: 6,
      id: 5,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer flex justify-start items-center h-full w-full ">
            <span className="text-black">
              {params?.row?.testcases?.length ?? "..."}
            </span>
          </div>
        );
      },
    },
  ];
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box>
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight="600"
                color="white"
                gutterBottom
              >
                Project Management
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.8)">
                Manage your testing projects and track their progress
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsAddingProject(true)}
              size="large"
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 4,
                py: 1.5,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                "&:hover": {
                  background: "rgba(255,255,255,0.3)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              Add New Project
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Add Project Dialog */}
      <Dialog
        open={isAddingProject || isEditingProject}
        onClose={() => {
          setIsAddingProject(false);
          setIsEditingProject(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AddIcon color="primary" />
            {isAddingProject ? "Add New Project" : "Update Project"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Project Title"
            multiline
            rows={1}
            fullWidth
            variant="outlined"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
            placeholder="Enter Project Title"
            sx={{ mb: 2 }}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Project URL"
            type="url"
            fullWidth
            variant="outlined"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            required
            placeholder="https://example.com"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Project Description"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            required
            placeholder="Describe what this application does and what you want to test..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setIsAddingProject(false);
              setIsEditingProject(false);
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={() => {
              if (isAddingProject) {
                handleAddProject();
              } else if (isEditingProject) {
                handleEditProject();
              }
            }}
            startIcon={<AddIcon />}
          >
            {isAddingProject ? "Add Project" : "Update Project"}
          </Button>
        </DialogActions>
      </Dialog>
      <DataGrid
        rows={formattedRow || []}
        columns={ProjectsTableColumn}
        disableColumnFilter
        disableColumnMenu
        disableColumnSorting
      />

      {/* Menu Item */}
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        slotProps={{
          paper: {
            sx: {
              boxShadow: "0px 1px 2px rgba(0,0,0,0.2)",
              overflow: "visible",
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                left: "45%",
                height: 10,
                width: 10,
                backgroundColor: "inherit",
                zIndex: -1,
                //marginLeft: "0.5px",
                transform: "translateY(-50%) rotate(45deg)",
                boxShadow: "0px 0px 2px rgba(0,0,0,0.2)",
              },
            },
          },
        }}
      >
        <MenuItem
          onClick={(e) => {
            handleClose();
            navigate(`/projects/${selectedItem.id}`);
          }}
          className="!text-[12px]"
        >
          <img src={ViewIcon} alt="ViewIcon" className="pr-3 w-[30px]" />
          View Project
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleEditClick();
          }}
          className="!text-[12px]"
        >
          <EditIcon className="pr-2" />
          Edit Project
        </MenuItem>
      </Menu>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
