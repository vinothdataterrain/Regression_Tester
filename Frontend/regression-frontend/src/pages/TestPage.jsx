import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  Container,
  Button,
  TextField,
  Paper,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Alert,
  Snackbar,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  FormHelperText,
  Tooltip,
  Breadcrumbs,
  Link,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
  useMediaQuery,
  Backdrop,
  Menu,
} from "@mui/material";
import {
  Add as AddIcon,
  Language as LanguageIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Link as LinkIcon,
  BugReport as TestIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  RemoveRedEye as ExpectIcon,
  Mouse as ClickIcon,
  Keyboard as FillIcon,
  Info as InfoIcon,
  UploadFile,
  FileDownload,
  ArrowBack as ArrowBackIcon,
  Launch as LaunchIcon,
  ChevronRight,
  Description,
  ExpandMore,
  PlayArrow,
  List,
  KeyboardArrowDown,
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import {
  useCreateTestCaseMutation,
  useDeleteGroupMutation,
  useDeleteTestCaseMutation,
  useEditTestCaseMutation,
  useGetGroupsQuery,
  useGetProjectbyIdQuery,
  useRunGroupMutation,
  useRunTestCaseMutation,
} from "../services/runTestCases.api.services";
import { convertToPlaywrightFormat } from "../utils/playwrightFormat";
import { toast } from "react-toastify";
import { useToast } from "../components/toast";
import {
  PLAYWRIGHT_ACTIONS,
  SELECTOR_EXAMPLES,
  DOMAIN,
} from "../utils/constant";
import { useNavigate, useParams } from "react-router-dom";
import SuccessGradientMessage from "../components/successPopup";

import { SelectBox } from "../components/common/selectBox";
import Group from "../components/module/addGroup";
import { CustomPagination } from "../utils/customPagination";

export default function TestPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [currentProject, setCurrentProject] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [stateOption, setStateOption] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 1,
    pageSize: 6,
  });

  // Test case states
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  // const [isRunning, setIsRunning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAddingTestCase, setIsAddingTestCase] = useState(false);
  const [isAddingJson, setIsAddingJson] = useState(false);
  const [isEditingTestCase, setIsEditingTestCase] = useState(false);
  const [testCaseName, setTestCaseName] = useState("");
  const [testCaseReports, setTestCaseReports] = useState({});
  //group states
  const [group, setGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [expandedTestcases, setExpandedTestcases] = useState(false);
  const [moduleResult, setModuleResult] = useState(null);
  const [showModuleResult, setShowModueResult] = useState(false);
  const [groupReport, setGroupReport] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [mode, setMode] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  const { success } = useToast();
  const [showBackdrop, setShowBackdrop] = useState(false);
  const theme = useTheme();
  const isMdscreen = useMediaQuery(theme.breakpoints.up("md"));
  const [testSteps, setTestSteps] = useState([
    { action: "", field: "", value: "" },
  ]);
  const [runningTests, setRunningTests] = useState(new Set());
  const fileInputRef = useRef(null);

  const [createTestCase] = useCreateTestCaseMutation();
  const [EditTestCase] = useEditTestCaseMutation();
  const [
    RunTestCase,
    {
      isSuccess: isTestcaseSuccess,
      isError: isTestcaseError,
      error: testcaseError,
      isLoading: testcaseLoading,
    },
  ] = useRunTestCaseMutation();
  const [deleteTestCase] = useDeleteTestCaseMutation();

  const [
    groupRun,
    {
      isSuccess: isGroupRunSuccess,
      isError: isGroupRunError,
      error: groupRunError,
      isLoading: isGroupRunLoading,
    },
  ] = useRunGroupMutation();

  const [deleteGroup] = useDeleteGroupMutation();

  const { data, isLoading, error } = useGetProjectbyIdQuery(projectId);

  const { data: groupData } = useGetGroupsQuery(
    {
      page: paginationModel?.page,
      limit: paginationModel?.pageSize,
      id: currentProject?.id,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const GroupList =
    groupData?.results?.map((e) => ({ label: e.name, value: e.id })) || [];

  // Set the current project directly from API response
  useEffect(() => {
    if (data) {
      setCurrentProject(data);
      setSelectedProject(data);
    }
  }, [data]);

  useEffect(() => {
    if (isTestcaseSuccess) {
      setShowBackdrop(true);
      setTimeout(() => {
        setShowBackdrop(false);
      }, 3000);
    } else if (isTestcaseError && testcaseError) {
      toast.error(testcaseError?.data?.error || "Failed to run testcase!");
    }
  }, [isTestcaseError, isTestcaseSuccess]);
  useEffect(() => {
    if (isGroupRunSuccess) {
      toast.success("Module Testcase Run Successfully!");
    } else if (isGroupRunError && groupRunError) {
      toast.error(groupRunError?.error || "Failed to run module!");
    }
  }, [isGroupRunSuccess, isGroupRunError]);
  const handleAddTestCase = (project) => {
    setSelectedProject(project);
    setIsAddingTestCase(true);
    setTestCaseName("");
    setTestSteps([{ action: "", field: "", value: "" }]);
  };

  const handlePageChange = (newPage) => {
    setPaginationModel((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const toggleGroup = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getActionColor = (action) => {
    const colors = {
      use: "bg-purple-100 text-purple-700",
      goto: "bg-blue-100 text-blue-700",
      click: "bg-green-100 text-green-700",
      fill: "bg-orange-100 text-orange-700",
      check: "bg-pink-100 text-pink-700",
    };
    return colors[action] || "bg-gray-100 text-gray-700";
  };

  const handleActionClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditTestCase = async (testCase) => {
    try {
      const updatedTestcaseData = {
        project: selectedProject.id,
        name: testCaseName,
        steps: [
          ...(stateOption === "use" && currentProject
            ? [{ action: "use", value: `${currentProject.name}.json` }]
            : []),
          ...testSteps.map((step) => ({
            action: step.action,
            selector: step.field,
            value: step.value || "",
            ...(step.url && { url: step.url }),
          })),
          ...(stateOption === "save" && currentProject
            ? [{ action: "save", value: `${currentProject.name}.json` }]
            : []),
        ],
      };
      await EditTestCase({
        id: testCase.id,
        data: updatedTestcaseData,
      }).unwrap();

      toast.success("Testcase updated successfully!");
      // setSnackbar({
      //   open: true,
      //   message: "Test case updated successfully!",
      //   severity: "success",
      // });

      setIsEditingTestCase(false);
      setSelectedProject(null);
      setTestCaseName("");
      setTestSteps([{ action: "", field: "", value: "" }]);
    } catch (error) {
      console.error("Failed to edit test case:", error);
      setSnackbar({
        open: true,
        message: "Failed to edit test case",
        severity: "error",
      });
    }
  };

  const handleDeleteTestcase = async (testCase) => {
    try {
      const response = await deleteTestCase(testCase?.id);
      if (response) {
        toast.success("Testcase deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete testcase:", error);
      toast.error("Failed to delete testcase!");
    }
  };

  const handleLastStep = () => {
    setTestSteps((prev) => [...prev, { action: "", field: "", value: "" }]);
  };

  const handleAddStep = (index) => {
    setTestSteps((prev) => {
      const newStep = { action: "", field: "", value: "" };
      const updated = [...prev];
      updated.splice(index + 1, 0, newStep);
      return updated;
    });
  };

  const handleRemoveStep = (index) => {
    setTestSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStepChange = (index, field, value) => {
    setTestSteps((prev) =>
      prev.map((step, i) => {
        if (i === index) {
          const updatedStep = { ...step, [field]: value };
          // If action changes to/from goto, handle field mapping
          if (field === "action") {
            if (value === "goto") {
              // When changing to goto, move field value to url
              updatedStep.url = step.field || "";
              updatedStep.field = "";
            } else if (step.action === "goto") {
              // When changing from goto, move url to field
              updatedStep.field = step.url || "";
              updatedStep.url = "";
            }
          }
          return updatedStep;
        }
        return step;
      })
    );
  };

  const handleSaveTestCase = async () => {
    if (!testCaseName.trim() || testSteps.some((step) => !step.action)) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    try {
      const data = {
        project: selectedProject.id,
        name: testCaseName,
        ...(selectedGroup && { group: selectedGroup }),
        steps: [
          ...(stateOption === "use" && currentProject
            ? [{ action: "use", value: `${currentProject.name}.json` }]
            : []),
          ...testSteps.map((step) => ({
            action: step.action,
            selector: step.field,
            value: step.value || "",
            ...(step.url && { url: step.url }),
          })),
          ...[{ action: "wait", selector: "", value: "5000" }],
          ...(stateOption === "save" && currentProject
            ? [{ action: "save", value: `${currentProject.name}.json` }]
            : []),
        ],
      };

      await createTestCase(data).unwrap();

      toast.success("Test case added successfully!");

      // setSnackbar({
      //   open: true,
      //   message: "Test case added successfully!",
      //   severity: "success",
      // });

      setIsAddingTestCase(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Failed to create test case:", error);
      setSnackbar({
        open: true,
        message: "Failed to add test case",
        severity: "error",
      });
      toast.error("Failed to save testcase!");
    }
  };

  const handleRunTestCase = async (project, testCase) => {
    const testId = `${project.id}-${testCase.id}`;
    setUploadedFile();
    setRunningTests((prev) => new Set([...prev, testId]));
    //setIsRunning(true);

    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append("file", uploadedFile);
      }
      const response = await RunTestCase({
        id: testCase.id,
        file: formData,
      }).unwrap();

      if (uploadedFile && response) {
        navigate(`/results/${testCase.id}`);
      } else {
        // Store report path for this specific test case
        setTestCaseReports((prev) => ({
          ...prev,
          [testCase.id]: response?.report,
        }));
        // setSnackbar({
        //   open: true,
        //   message: `test case ${
        //     response?.status === "completed" ? "passed" : "failed"
        //   }`,
        //   severity: `${response?.status === "completed" ? "success" : "error"}`,
        // });
      }
    } catch (error) {
      console.error("Test execution failed:", error);
    } finally {
      //setIsRunning(false);
      setRunningTests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };

  const handleAddGroup = () => {
    setMode("add");
    setSelectedModule("");
  };
  const handleEditGroup = (module) => {
    setMode("edit");
    setSelectedModule(module);
    handleClose();
  };

  const handleGroupRun = async (groupId) => {
    try {
      const ModuleResult = await groupRun({ id: groupId });
      setModuleResult(ModuleResult);
      setShowModueResult(true);
      setGroupReport((prev) => ({
        ...prev,
        [groupId]: ModuleResult?.data?.group_report,
      }));
    } catch (error) {
      console.error("error:", error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(groupId);
      handleClose();
      toast.success("Module deleted!!");
    } catch (error) {
      console.error("Error in deleting module: ", error);
      toast.error("Failed to delete Module!");
    }
  };

  const handleViewModuleResult = () => {
    navigate(`/projects/view-result`, { state: { data: moduleResult } });
  };

  const handleViewModuleReport = (report_url) => {
    const group_report_url = `${DOMAIN}/media/${report_url}`;
    window.open(group_report_url, "_blank");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
    e.target.value = null;
  };

  const handleExcelUpload = (e) => {
    const ExcelFile = e.target.files[0];
    if (ExcelFile) setUploadedFile(ExcelFile);
    success("File uploaded successfully!");
  };

  const handleUploadFile = async (selectedProject, testCaseName) => {
    if (!testCaseName.trim()) {
      alert("Please enter a test case name!");
      return;
    }
    if (!selectedFile) {
      alert("Please select a JSON file!");
      return;
    }

    try {
      const text = await selectedFile.text();
      const jsonData = JSON.parse(text);

      const PlaywrightFormat = convertToPlaywrightFormat(jsonData);

      const payloadData = {
        project: selectedProject?.id,
        name: testCaseName,
        ...(selectedGroup && { group: selectedGroup }),
        steps: [
          ...(stateOption === "use" && currentProject
            ? [{ action: "use", value: `${currentProject.name}.json` }]
            : []),
          ...PlaywrightFormat,
          ...[{ action: "wait", selector: "", value: "5000" }],
          ...(stateOption === "save" && currentProject
            ? [{ action: "save", value: `${currentProject.name}.json` }]
            : []),
        ],
      };
      try {
        await createTestCase(payloadData).unwrap();
        toast.success("Testcase added successfully!");
        setIsAddingTestCase(false);
        setIsAddingJson(false);
        setTestCaseName("");
        setSelectedFile(null);
        setStateOption(null);
      } catch (apiErr) {
        console.error("API error while creating test case:", apiErr);
        toast.error("Failed to create testcase");
      }
    } catch (err) {
      console.error("Failed to read or parse JSON file:", err);
      toast.error("Failed to read json file");
    }
  };

  const handleDownloadReport = (testCaseId) => {
    const reportPath = testCaseReports[testCaseId];
    if (reportPath) {
      const url = `${DOMAIN}/media/${reportPath}`;
      window.open(url, "_blank");
    } else {
      toast.error("Report is not available yet!");
    }
  };

  const getFieldPlaceholder = (action) => {
    const actionConfig = PLAYWRIGHT_ACTIONS.find((a) => a.value === action);
    return actionConfig ? actionConfig.example : "Enter value";
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading project data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            Failed to load projects data. Error:{" "}
            {error?.message || "Unknown error"}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/projects")}
            sx={{ mt: 2 }}
          >
            Back to Projects
          </Button>
        </Container>
      </Box>
    );
  }

  if (!currentProject && !isLoading && !error) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="warning">
            Project with ID "{projectId}" not found.
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/projects")}
            sx={{ mt: 2 }}
          >
            Back to Projects
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="w-full p-2">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={testcaseLoading || isGroupRunLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {/* Breadcrumb Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate("/projects")}
            sx={{ cursor: "pointer" }}
          >
            Projects
          </Link>
          <Typography color="text.primary">{currentProject?.name}</Typography>
        </Breadcrumbs>
        <Tooltip title="Create a module to organize related test cases. Test cases assigned here will run together as a group" placement="right">
          <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddGroup}
          size="small"
          sx={{ mb: 2 }}
        >
          Create Module
        </Button>
        </Tooltip>
        
      </Box>

      {/* Project Header */}
      <Card elevation={2} sx={{ mb: 4 }}>
        <CardContent>
          <Box
            className="flex flex-col space-y-2 md:space-y-0 md:flex-row "
            sx={{
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/projects")}
                  size="small"
                  className="!rounded-full !border !p-0 md:!px-2"
                >
                  {isMdscreen && "Back"}
                </Button>
                <Typography
                  variant="h6"
                  component="h1"
                  gutterBottom
                  sx={{ margin: 0 }}
                >
                  {currentProject?.name}
                </Typography>
              </Box>

              <Typography variant="h6" color="text.secondary" gutterBottom>
                {currentProject?.description}
              </Typography>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LanguageIcon color="primary" />
                  <Link
                    href={currentProject?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textDecoration: "none" }}
                  >
                    {currentProject?.url}
                  </Link>
                  <LaunchIcon sx={{ fontSize: 16 }} />
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label={`${currentProject?.groups?.length || 0} modules`}
                  size="small"
                  color="primary"
                  className="!bg-blue-200 !text-blue-500"
                />
                <Chip
                  label={`Created: ${new Date(
                    currentProject?.created_at
                  ).toLocaleDateString()}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>

            <Box
              sx={{ display: "flex", gap: 2 }}
              className=" w-full md:w-auto justify-between"
            >
              <Tooltip title="Add a new test case manually. You can choose to assign it to a module or keep it unassigned to run individually">
                <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedGroup("");
                  handleAddTestCase(currentProject);
                }}
                size="small"
                className="!min-w-[120px] !bg-blue-700"
              >
                {isMdscreen ? "Add Test Case" : "Add"}
              </Button>
              </Tooltip>
              
              <Tooltip title="Upload test steps using the JSON file from the Event Recorder extension">
                <Button
                  variant="outlined"
                  startIcon={<UploadFile />}
                  onClick={() => {
                    setTestCaseName("");
                    setSelectedGroup("");
                    setIsAddingJson(true);
                    setSelectedProject(currentProject);
                  }}
                  size="small"
                  className="!min-w-[120px]"
                >
                  {isMdscreen ? "Upload JSON" : "Upload"}
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Test Cases Section */}
      {groupData?.results?.length > 0 && (
        <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 3 }}>
          Modules ({currentProject?.groups?.length || 0})
        </Typography>
      )}

      <Box>
        <div className="grid gap-6">
          {groupData?.results?.map((grp) => (
            <div
              key={grp.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              onClick={() => {
                setGroup(grp);
                setSelectedGroup(grp.name);
              }}
            >
              {/* Group Header */}
              <div
                onClick={() => toggleGroup(grp.id)}
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {expandedGroups.has(grp.id) ? (
                        <ExpandMore className="w-5 h-5 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-semibold text-slate-800">
                              {grp.name}
                            </h2>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                              ID: {grp.id}
                            </span>
                            {showModuleResult && groupReport[grp.id] && (
                              <div className="ml-2">
                                <Button
                                  className="!bg-green-700 !text-white"
                                  bgcolor="success.main"
                                  onClick={handleViewModuleResult}
                                >
                                  View Result
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-slate-600 mb-3">
                            {grp.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <List className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-600">
                              {grp.testcases.length} test case
                              {grp.testcases.length !== 1 ? "s" : ""}
                            </span>

                            {grp?.group_report &&
                              grp?.group_report.trim() !== "" && (
                                <div>
                                  <Button
                                    onClick={() =>
                                      handleViewModuleReport(grp?.group_report)
                                    }
                                    className="ml-2"
                                  >
                                    Report
                                  </Button>
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Tooltip title="Modify or delete the selected module">
                            <Button
                            endIcon={<KeyboardArrowDown />}
                            className="w-20 h-[30px] md:h-[50px] cursor-pointer md:w-auto text-xs md:text-md rounded-full px-3 p-2"
                            onClick={handleActionClick}
                          >
                            Action
                          </Button>
                          </Tooltip>
                          
                          <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{
                              "aria-labelledby": "basic-button",
                            }}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "center",
                            }}
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
                                    marginLeft: "0.5px",
                                    transform: "translateY(-50%) rotate(45deg)",
                                    boxShadow: "0px 0px 2px rgba(0,0,0,0.2)",
                                  },
                                },
                              },
                            }}
                          >
                            {
                              <Tooltip
                                title="Edit/Update Module"
                                placement="right"
                              >
                                <MenuItem
                                  className="!text-[12px]"
                                  onClick={() => handleEditGroup(group)}
                                >
                                  <EditIcon className="pr-2" />
                                  Edit
                                </MenuItem>
                              </Tooltip>
                            }
                            {
                              <Tooltip title="Delete Module" placement="right">
                                <MenuItem
                                  className="!text-[12px]"
                                  onClick={() => handleDeleteGroup(grp?.id)}
                                >
                                  <DeleteIcon className="pr-2" />
                                  Delete
                                </MenuItem>
                              </Tooltip>
                            }
                          </Menu>
                          <div className="mt-2">
                            <Tooltip title="Run the module to execute all linked test cases together">
                              <Button
                              size="small"
                              variant="contained"
                              startIcon={<PlayIcon />}
                              className="p-1 w-8 md:w-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGroupRun(grp?.id);
                              }}
                            >
                              {"Run"}
                            </Button>
                            </Tooltip> 
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Cases */}
              {expandedGroups.has(grp.id) && (
                <div className="border-t border-slate-200 bg-slate-50">
                  {grp.testcases.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Description className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                      <p>No test cases in this group</p>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      {grp.testcases.map((testcase) => (
                        <div
                          key={testcase.id}
                          className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                        >
                          {/* Test Case Header */}
                          <div
                            onClick={() =>
                              setSelectedTestCase(
                                selectedTestCase === testcase.id
                                  ? null
                                  : testcase.id
                              )
                            }
                            className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <PlayArrow className="w-5 h-5 text-emerald-600" />
                                <div>
                                  <h3 className="font-semibold text-slate-800">
                                    {testcase.name}
                                  </h3>
                                  <p className="text-sm text-slate-500">
                                    {testcase.steps.length} steps • Created{" "}
                                    {new Date(
                                      testcase.created_at
                                    ).toLocaleDateString()}
                                  </p>

                                  <Box>
                                    {testCaseReports[testcase.id] &&
                                      !uploadedFile && (
                                        <Tooltip title="Download the HTML report for this test run, including the recorded video and HAR file of API activity">
                                          <IconButton
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDownloadReport(testcase.id);
                                            }}
                                            color="primary"
                                          >
                                            <FileDownload />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    <Tooltip title="Upload an Excel file to perform data-driven testing. Each row is executed as a separate test">
                                      <Button
                                        variant="outlined"
                                        startIcon={<UploadFile />}
                                        onClick={() =>
                                          fileInputRef.current?.click()
                                        }
                                        //className="rounded-full min-w-4 mx-auto md:rounded-md"
                                      >
                                        {isMdscreen && "Upload Data"}
                                        <input
                                          type="file"
                                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                          ref={fileInputRef}
                                          style={{ display: "none" }}
                                          onChange={handleExcelUpload}
                                        />
                                      </Button>
                                    </Tooltip>
                                    <Tooltip title="Edit Test Case">
                                      <IconButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedProject(currentProject);
                                          setSelectedTestCase(testcase);
                                          setTestCaseName(testcase.name);
                                          setTestSteps(
                                            testcase.steps.map((step) => ({
                                              action: step.action || "",
                                              field:
                                                step.action === "goto"
                                                  ? step.url || ""
                                                  : step.selector || "",
                                              value: step.value || "",
                                              url: step.url || "", // Add URL field for goto actions
                                            }))
                                          );
                                          setIsEditingTestCase(true);
                                        }}
                                        className="rounded-full border"
                                      >
                                        <EditIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Test Case">
                                      <IconButton
                                        onClick={() =>
                                          handleDeleteTestcase(testcase)
                                        }
                                        color="error"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Run the testcase to generate reports and recordings" placement="right">
                                      <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={
                                        runningTests.has(
                                          `${currentProject?.id}-${testcase?.id}`
                                        ) ? (
                                          <CircularProgress
                                            size={16}
                                            color="inherit"
                                          />
                                        ) : (
                                          <PlayIcon />
                                        )
                                      }
                                      className="p-1 w-8 md:w-auto"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRunTestCase(
                                          currentProject,
                                          testcase
                                        );
                                      }}
                                    >
                                      {isMdscreen &&
                                        (runningTests.has(
                                          `${currentProject?.id}-${testcase?.id}`
                                        )
                                          ? "Running..."
                                          : "Run")}
                                    </Button>
                                    </Tooltip>
                                  </Box>
                                </div>
                              </div>
                              {selectedTestCase === testcase.id ? (
                                <ExpandMore className="w-5 h-5 text-slate-600" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-slate-600" />
                              )}
                            </div>
                          </div>

                          {/* Test Steps */}
                          {selectedTestCase === testcase.id && (
                            <div className="border-t border-slate-200 bg-slate-50 p-4">
                              <div className="space-y-3">
                                {testcase.steps.map((step) => (
                                  <div
                                    key={step.step_number}
                                    className="bg-white rounded-lg p-4 border border-slate-200"
                                  >
                                    <div className="flex items-start gap-4">
                                      <div className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                        {step.step_number}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                                              step.action
                                            )}`}
                                          >
                                            {step.action.toUpperCase()}
                                          </span>
                                        </div>
                                        {step.selector && (
                                          <div className="mb-2">
                                            <span className="text-xs text-slate-500 font-medium">
                                              Selector:
                                            </span>
                                            <code className="ml-2 text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 break-all">
                                              {step.selector}
                                            </code>
                                          </div>
                                        )}
                                        {step.value && (
                                          <div className="mb-2">
                                            <span className="text-xs text-slate-500 font-medium">
                                              Value:
                                            </span>
                                            <code className="ml-2 text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">
                                              {step.value}
                                            </code>
                                          </div>
                                        )}
                                        {step.url && (
                                          <div>
                                            <span className="text-xs text-slate-500 font-medium">
                                              URL:
                                            </span>
                                            <a
                                              href={step.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="ml-2 text-sm text-blue-600 hover:text-blue-800 break-all"
                                            >
                                              {step.url}
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {groupData?.testcases && groupData?.testcases?.length > 0 && (
            <Accordion
              expanded={expandedTestcases}
              onChange={() => setExpandedTestcases(!expandedTestcases)}
              className="border rounded-2xl border-slate-300"
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                id="unassigned-testcases-header"
                sx={{
                  px: 3,
                  py: 2,
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.02)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Description className="w-8 h-8 text-slate-600" />
                  <Tooltip title="Standalone test cases that are treated as single test runs">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Individual Test Cases
                  </Typography>
                  </Tooltip>
                  
                  <Chip
                    label={`${groupData?.testcases?.length || 0} test case${
                      groupData?.testcases?.length !== 1 ? "s" : ""
                    }`}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <div className="p-6 space-y-4">
                  {groupData?.testcases?.map((testcase) => (
                    <div
                      key={testcase.id}
                      className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                    >
                      {/* Test Case Header */}
                      <div
                        onClick={() =>
                          setSelectedTestCase(
                            selectedTestCase === testcase.id
                              ? null
                              : testcase.id
                          )
                        }
                        className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <PlayArrow className="w-5 h-5 text-emerald-600" />
                            <div>
                              <h3 className="font-semibold text-slate-800">
                                {testcase.name}
                              </h3>
                              <p className="text-sm text-slate-500">
                                {testcase.steps.length} steps • Created{" "}
                                {new Date(
                                  testcase.created_at
                                ).toLocaleDateString()}
                              </p>

                              <Box>
                                {testCaseReports[testcase.id] &&
                                  !uploadedFile && (
                                    <Tooltip title="Download the HTML report for this test run, including the recorded video and HAR file of API activity">
                                      <IconButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDownloadReport(testcase.id);
                                        }}
                                        color="primary"
                                      >
                                        <FileDownload />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                <Tooltip title="Upload an Excel file to perform data-driven testing. Each row is executed as a separate test">
                                  <Button
                                    variant="outlined"
                                    startIcon={<UploadFile />}
                                    onClick={() =>
                                      fileInputRef.current?.click()
                                    }
                                    //className="rounded-full min-w-4 mx-auto md:rounded-md"
                                  >
                                    {isMdscreen && "Upload Data"}
                                    <input
                                      type="file"
                                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                      ref={fileInputRef}
                                      style={{ display: "none" }}
                                      onChange={handleExcelUpload}
                                    />
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Edit Test Case">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedProject(currentProject);
                                      setSelectedTestCase(testcase);
                                      setTestCaseName(testcase.name);
                                      setTestSteps(
                                        testcase.steps.map((step) => ({
                                          action: step.action || "",
                                          field:
                                            step.action === "goto"
                                              ? step.url || ""
                                              : step.selector || "",
                                          value: step.value || "",
                                          url: step.url || "", // Add URL field for goto actions
                                        }))
                                      );
                                      setIsEditingTestCase(true);
                                    }}
                                    className="rounded-full border"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Test Case">
                                  <IconButton
                                    onClick={() =>
                                      handleDeleteTestcase(testcase)
                                    }
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Run the testcase to generate reports and recordings" placement="right">
                                  <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={
                                    runningTests.has(
                                      `${currentProject?.id}-${testcase?.id}`
                                    ) ? (
                                      <CircularProgress
                                        size={16}
                                        color="inherit"
                                      />
                                    ) : (
                                      <PlayIcon />
                                    )
                                  }
                                  className="p-1 w-8 md:w-auto"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRunTestCase(currentProject, testcase);
                                  }}
                                >
                                  {isMdscreen &&
                                    (runningTests.has(
                                      `${currentProject?.id}-${testcase?.id}`
                                    )
                                      ? "Running..."
                                      : "Run")}
                                </Button>
                                </Tooltip>
                                
                              </Box>
                            </div>
                          </div>
                          {selectedTestCase === testcase.id ? (
                            <ExpandMore className="w-5 h-5 text-slate-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                      </div>

                      {/* Test Steps */}
                      {selectedTestCase === testcase.id && (
                        <div className="border-t border-slate-200 bg-slate-50 p-4">
                          <div className="space-y-3">
                            {testcase.steps.map((step) => (
                              <div
                                key={step.step_number}
                                className="bg-white rounded-lg p-4 border border-slate-200"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                    {step.step_number}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                                          step.action
                                        )}`}
                                      >
                                        {step.action.toUpperCase()}
                                      </span>
                                    </div>
                                    {step.selector && (
                                      <div className="mb-2">
                                        <span className="text-xs text-slate-500 font-medium">
                                          Selector:
                                        </span>
                                        <code className="ml-2 text-sm bg-slate-100 px-2 py-1 rounded text-slate-700 break-all">
                                          {step.selector}
                                        </code>
                                      </div>
                                    )}
                                    {step.value && (
                                      <div className="mb-2">
                                        <span className="text-xs text-slate-500 font-medium">
                                          Value:
                                        </span>
                                        <code className="ml-2 text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">
                                          {step.value}
                                        </code>
                                      </div>
                                    )}
                                    {step.url && (
                                      <div>
                                        <span className="text-xs text-slate-500 font-medium">
                                          URL:
                                        </span>
                                        <a
                                          href={step.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="ml-2 text-sm text-blue-600 hover:text-blue-800 break-all"
                                        >
                                          {step.url}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionDetails>
            </Accordion>
          )}
        </div>
        {groupData?.results?.length > 0 && (
          <div className="my-4">
            <CustomPagination
              totalItems={groupData?.count || 0}
              pageSize={paginationModel.pageSize}
              currentPage={paginationModel.page}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Box>

      {/* Add Test Case Dialog - Enhanced with Better Guidance */}
      <Dialog
        open={isAddingTestCase || isEditingTestCase}
        onClose={() => {
          setIsAddingTestCase(false);
          setIsEditingTestCase(false);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CodeIcon color="primary" />
            {isEditingTestCase ? "Edit Test Case" : "Add Test Case"} -{" "}
            {selectedProject?.url}
          </Box>
        </DialogTitle>
        <form>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Test Case Name"
              fullWidth
              variant="outlined"
              value={testCaseName}
              onChange={(e) => setTestCaseName(e.target.value)}
              required
              placeholder="e.g., User Login Flow Test"
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 2 }}>
              <Typography sx={{ mb: 1 }}>Assign To Module</Typography>
              <SelectBox
                value={selectedGroup}
                placeholder={
                  GroupList?.length > 0 ? "Select Module" : "No Module Found"
                }
                menuList={GroupList}
                handleChange={(e) => setSelectedGroup(e.target.value)}
              />
            </Box>

            <Typography variant="h6" gutterBottom>
              Test Steps
            </Typography>

            {/* Improved Help Section */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Selector Tips:</strong>
                <br />• Use specific selectors: <code>input[name="email"]</code>
                , <code>button[type="submit"]</code>
                <br />• For buttons with text:{" "}
                <code>button:has-text("Login")</code>
                <br />• Use IDs when available: <code>#login-btn</code>
                <br />• For your login form try:{" "}
                <code>input[name="email"]</code>,{" "}
                <code>input[name="password"]</code>,{" "}
                <code>button[type="submit"]</code>
              </Typography>
            </Alert>

            {testSteps.map((step, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{ p: 3, mb: 2, bgcolor: "grey.50" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ minWidth: 80, mt: 1 }}>
                    Step {index + 1}
                  </Typography>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Action *</InputLabel>
                    <Select
                      value={step.action}
                      onChange={(e) =>
                        handleStepChange(index, "action", e.target.value)
                      }
                      label="Action *"
                      required
                    >
                      {PLAYWRIGHT_ACTIONS.map((action) => (
                        <MenuItem key={action.value} value={action.value}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>{action.icon}</span>
                            <Box>
                              <Typography variant="body2">
                                {action.label}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {action.description}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {step.action && (
                      <FormHelperText>
                        Example:{" "}
                        {
                          PLAYWRIGHT_ACTIONS.find(
                            (a) => a.value === step.action
                          )?.example
                        }
                      </FormHelperText>
                    )}
                  </FormControl>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      onClick={() => handleRemoveStep(index)}
                      disabled={testSteps?.length === 1}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => handleAddStep(index)}
                    >
                      Add Step
                    </Button>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  {step.action !== "use" && step.action !== "save" && (
                    <>
                      <TextField
                        label={step.action === "goto" ? "URL *" : "Selector *"}
                        value={
                          step.action === "goto"
                            ? step.url || ""
                            : step.field || ""
                        }
                        onChange={(e) =>
                          handleStepChange(
                            index,
                            step.action === "goto" ? "url" : "field",
                            e.target.value
                          )
                        }
                        sx={{ flexGrow: 1 }}
                        required
                        placeholder={getFieldPlaceholder(step.action)}
                        helperText={
                          step.action === "goto"
                            ? "Full URL or path (e.g., /login)"
                            : step.action === "click"
                            ? 'Try: button[type="submit"], #login-btn'
                            : step.action === "fill"
                            ? 'Try: input[name="fieldname"], input[type="fieldname"]'
                            : step.action === "wait"
                            ? "Time in milliseconds (e.g., 2000 for 2 seconds)"
                            : "CSS selector to target the element"
                        }
                      />
                      {(step.action === "fill" ||
                        step.action === "select" ||
                        step.action === "expect_text" ||
                        step.action === "wait") && (
                        <TextField
                          label={
                            step.action === "expect_text"
                              ? "Expected Text *"
                              : "Value *"
                          }
                          value={step.value}
                          onChange={(e) =>
                            handleStepChange(index, "value", e.target.value)
                          }
                          placeholder={
                            step.action === "expect_text"
                              ? "Text to verify"
                              : step.action === "fill"
                              ? "Text to enter"
                              : "Option value"
                          }
                          sx={{ minWidth: 200 }}
                          required={
                            step.action === "fill" ||
                            step.action === "expect_text"
                          }
                        />
                      )}
                    </>
                  )}
                </Box>

                {/* Common selector suggestions */}
                {step.action === "click" && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Common login button selectors:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      {[
                        'button[type="submit"]',
                        "#login-btn",
                        ".login-button",
                        'button:has-text("Login")',
                        'input[type="submit"]',
                      ].map((selector) => (
                        <Chip
                          key={selector}
                          label={selector}
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            handleStepChange(index, "field", selector)
                          }
                          sx={{ cursor: "pointer", fontSize: "0.75rem" }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {step.action === "fill" && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Common input selectors:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      {[
                        'input[name="fieldname"]',
                        'input[type="fieldname"]',
                        "#fieldname",
                      ].map((selector) => (
                        <Chip
                          key={selector}
                          label={selector}
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            handleStepChange(index, "field", selector)
                          }
                          sx={{ cursor: "pointer", fontSize: "0.75rem" }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            ))}
            {!isEditingTestCase && (
              <RadioGroup
                value={stateOption}
                onChange={(e) => setStateOption(e.target.value)}
              >
                <FormControlLabel
                  value="null"
                  control={<Radio />}
                  label={
                    <Tooltip
                      title="Start each test with a login flow"
                      placement="right"
                    >
                      <span>Login Fresh</span>
                    </Tooltip>
                  }
                />
                <FormControlLabel
                  value="save"
                  control={<Radio />}
                  label={
                    <Tooltip
                      title="Remember Login info for future test"
                      placement="right"
                    >
                      <span>Remember Login</span>
                    </Tooltip>
                  }
                />
                <FormControlLabel
                  value="use"
                  control={<Radio />}
                  label={
                    <Tooltip
                      title="Use previously saved login info"
                      placement="right"
                    >
                      <span>Use Saved Login</span>
                    </Tooltip>
                  }
                />
              </RadioGroup>
            )}

            <Button
              startIcon={<AddIcon />}
              onClick={handleLastStep}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add Step
            </Button>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => {
                setIsAddingTestCase(false);
                setIsEditingTestCase(false);
                setTestCaseName("");
              }}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<CodeIcon />}
              onClick={() => {
                if (isAddingTestCase) {
                  handleSaveTestCase();
                } else if (isEditingTestCase) {
                  handleEditTestCase(selectedTestCase);
                }
              }}
            >
              {isEditingTestCase ? "Update Test Case" : "Save Test Case"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Upload JSON Dialog */}
      <Dialog
        open={isAddingJson}
        onClose={() => setIsAddingJson(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AddIcon color="primary" />
            Add New Testcase
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Testcase Name"
            multiline
            rows={1}
            fullWidth
            variant="outlined"
            value={testCaseName}
            onChange={(e) => setTestCaseName(e.target.value)}
            required
            placeholder="Enter Testcase Title"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Select JSON File
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleFileSelect}
              />
            </Button>
            <Box>
              <Typography>Assign To Module</Typography>
              <SelectBox
                value={selectedGroup}
                placeholder={
                  GroupList?.length > 0 ? "Select Module" : "No Module Found"
                }
                menuList={GroupList}
                handleChange={(e) => setSelectedGroup(e.target.value)}
              />
            </Box>
          </Box>

          {selectedFile && (
            <Typography sx={{ mt: 1 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Browser State Options:
            </Typography>
            <RadioGroup
              value={stateOption}
              onChange={(e) => setStateOption(e.target.value)}
              sx={{ ml: 1 }}
            >
              <FormControlLabel
                value="null"
                control={<Radio />}
                label={
                  <Tooltip
                    title="Start each test with a login flow"
                    placement="right"
                  >
                    <span>Login Fresh</span>
                  </Tooltip>
                }
              />
              <FormControlLabel
                value="save"
                control={<Radio />}
                label={
                  <Tooltip
                    title="Remember Login info for future test"
                    placement="right"
                  >
                    <span>Remember Login</span>
                  </Tooltip>
                }
              />
              <FormControlLabel
                value="use"
                control={<Radio />}
                label={
                  <Tooltip
                    title="Use previously saved login info"
                    placement="right"
                  >
                    <span>Use Saved Login</span>
                  </Tooltip>
                }
              />
            </RadioGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsAddingJson(false);
              setStateOption(null);
              setSelectedFile(null);
              setTestCaseName("");
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={() => {
              setIsAddingJson(true);
              handleUploadFile(selectedProject, testCaseName);
            }}
          >
            {"Save Test Case"}
          </Button>
        </DialogActions>
      </Dialog>

      <Group
        open={mode !== null}
        mode={mode}
        currentProject={currentProject}
        selectedModule={selectedModule}
        onClose={() => setMode(null)}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <SuccessGradientMessage
        message="Testcase run completed successfully!"
        isBackdropOpen={showBackdrop}
      />
    </Box>
  );
}
