import React, { useState } from "react";
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
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import {
  useCreateProjectMutation,
  useCreateTestCaseMutation,
  useEditTestCaseMutation,
  useGetProjectsQuery,
  useRunTestCaseMutation,
} from "../services/runTestCases.api.services";
import { convertToPlaywrightFormat } from "../utils/playwrightFormat";
import { toast } from "react-toastify";
import { useToast } from "../components/toast";
import { PLAYWRIGHT_ACTIONS, SELECTOR_EXAMPLES } from "../utils/constant";

export default function TestPage() {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Test case states
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAddingTestCase, setIsAddingTestCase] = useState(false);
  const [isAddingJson, setIsAddingJson] = useState(false);
  const [isEditingTestCase, setIsEditingTestCase] = useState(false);
  const [testCaseName, setTestCaseName] = useState("");
  const [testProgress, setTestProgress] = useState({});

  const { success } = useToast();

  const [testSteps, setTestSteps] = useState([
    { action: "", field: "", value: "" },
  ]);
  const [runningTests, setRunningTests] = useState(new Set());

  const [createProject] = useCreateProjectMutation();

  const [createTestCase] = useCreateTestCaseMutation();

  const [EditTestCase] = useEditTestCaseMutation();

  const [RunTestCase] = useRunTestCaseMutation();

  const { data } = useGetProjectsQuery();

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
      // await createProgram(ProjectData);

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(ProjectData),
        redirect: "follow",
      };

      fetch(
        "https://wtf6tv6m-8000.inc1.devtunnels.ms/api/projects/",
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));

      //   const formdata = new FormData();
      //   formdata.append("name",projectTitle);
      //   formdata.append("url",projectUrl);
      //   formdata.append("description",projectDescription);

      //   const result = await createProject(formdata).unwrap();
      setProjectTitle("");
      setProjectUrl("");
      setProjectDescription("");
      setIsAddingProject("");
      setSnackbar({
        open: true,
        message: "Project added successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleAddTestCase = (project) => {
    setSelectedProject(project);
    setIsAddingTestCase(true);
    setTestCaseName("");
    setTestSteps([{ action: "", field: "", value: "" }]);
  };

  const handleEditTestCase = async (testCase) => {
    try {
      console.log("testing1", selectedProject?.id, testCaseName, testSteps);
      // setIsEditingTestCase(true);

      const updatedTestcaseData = {
        project: selectedProject.id,
        name: testCaseName,
        steps: testSteps.map((step) => ({
          action: step.action,
          selector: step.field,
          value: step.value || "",
        })),
      };
      console.log("testing2");
      // Call mutation
      const result = await EditTestCase({
        id: testCase.id, // test case ID
        data: updatedTestcaseData,
      }).unwrap();

      console.log("result", result);

      // ✅ Update UI immediately
      setSnackbar({
        open: true,
        message: "Test case updated successfully!",
        severity: "success",
      });

      // Optionally update local state of test cases if you maintain a list
      // setTestCases(prev =>
      //   prev.map(tc => (tc.id === testCase.id ? result : tc))
      // );

      // Reset editing state
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

  const handleAddStep = () => {
    setTestSteps((prev) => [...prev, { action: "", field: "", value: "" }]);
  };

  const handleRemoveStep = (index) => {
    setTestSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStepChange = (index, field, value) => {
    setTestSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step))
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
        steps: testSteps.map((step) => ({
          action: step.action,
          selector: step.field,
          value: step.value || "",
        })),
      };
      await createTestCase(data).unwrap();

      //  const myHeaders = new Headers();
      //   myHeaders.append("Content-Type", "application/json");

      //   const requestOptions = {
      //     method: "POST",
      //     headers: myHeaders,
      //     body: JSON.stringify(TestCaseData),
      //     redirect: "follow",
      //   };

      //   fetch(
      //     "https://pbkzt3vt-8000.usw2.devtunnels.ms/api/testcases/",
      //     requestOptions
      //   )
      //     .then((response) => response.json())
      //     .then((result) => console.log(result))
      //     .catch((error) => console.error(error));

      setSnackbar({
        open: true,
        message: "Test case added successfully!",
        severity: "success",
      });

      setIsAddingTestCase(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Failed to create test case:", error);
      setSnackbar({
        open: true,
        message: "Failed to add test case",
        severity: "error",
      });
    }
  };

  const handleRunTestCase = async (project, testCase) => {
    const testId = `${project.id}-${testCase.id}`;
    setUploadedFile();
    setRunningTests((prev) => new Set([...prev, testId]));
    setIsRunning(true);

    try {
      // const formData = new FormData();
      // formData.append("file", uploadedFile);
      const result = await RunTestCase({ id: testCase.id});
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", "results.xlsx");
      // document.body.appendChild(link);
      // link.click();
      // link.parentNode.removeChild(link);

      // toast.success("Test case run completed! File downloaded.");

      setSnackbar({
        open: true,
        message:
          result?.data?.status === "passed" ? "Test passed!" : "Test failed!",
        severity: result?.data?.status === "passed" ? "success" : "error",
      });
    } catch (error) {
      console.error("Test execution failed:", error);
      toast.error("Failed to run test case");
    } finally {
      setIsRunning(false);
      setRunningTests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleExcelUpload = (e) => {
    const ExcelFile = e.target.files[0];
    if (ExcelFile) setUploadedFile(ExcelFile);
    success("File uploaded successfully!");
  };

  // const handleUploadFile = async (project, testcaseName) => {
  //   // Create a hidden file input dynamically
  //   const input = document.createElement("input");
  //   input.type = "file";
  //   input.accept = ".json"; // only allow JSON files

  //   input.onchange = async (e) => {
  //     const file = e.target.files[0];
  //     if (!file) return;

  //     try {
  //       const text = await selectedFile.text(); // read file content
  //       console.log("Raw file content:", text);
  //       const jsonData = JSON.parse(text); // parse JSON

  //       const PlaywrightFormat = convertToPlaywrightFormat(jsonData);

  //       const payloadData = {
  //         project: project?.id,
  //         name: testcaseName,
  //         steps: PlaywrightFormat,
  //       };
  //       console.log("payload", payloadData);
  //       try {
  //         await createTestCase(payloadData).unwrap();
  //         onsole.log("Playwright payload successfully sent:", payloadData);
  //       } catch (error) {
  //         console.log("error", error);
  //       }
  //       console.log("playwrightformat", PlaywrightFormat);
  //       console.log("Uploaded JSON data:", jsonData);

  //       // You can now store jsonData in state or pass to your processing function
  //       // setJsonData(jsonData);
  //     } catch (err) {
  //       console.error("Failed to read or parse JSON file:", err);
  //       alert("Invalid JSON file. Please upload a valid JSON file.");
  //     }
  //   };

  // };

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
      console.log("Raw file content:", text);
      const jsonData = JSON.parse(text);

      const PlaywrightFormat = convertToPlaywrightFormat(jsonData);

      const payloadData = {
        project: selectedProject?.id,
        name: testCaseName,
        steps: PlaywrightFormat,
      };

      console.log("payload", payloadData);

      try {
        await createTestCase(payloadData).unwrap();
        console.log("Playwright payload successfully sent:", payloadData);
        // Reset dialog
        setIsAddingTestCase(false);
        setIsAddingJson(false);
        setTestCaseName("");
        setSelectedFile(null);
      } catch (apiErr) {
        console.error("API error while creating test case:", apiErr);
      }

      console.log("Playwright format:", PlaywrightFormat);
      console.log("Uploaded JSON data:", jsonData);
    } catch (err) {
      console.error("Failed to read or parse JSON file:", err);
      // alert("Invalid JSON file. Please upload a valid JSON file.");
    }
  };
  const getFieldPlaceholder = (action) => {
    const actionConfig = PLAYWRIGHT_ACTIONS.find((a) => a.value === action);
    return actionConfig ? actionConfig.example : "Enter value";
  };

  const getSelectorSuggestions = (field) => {
    const fieldLower = field.toLowerCase();
    for (const [key, suggestions] of Object.entries(SELECTOR_EXAMPLES)) {
      if (fieldLower.includes(key)) {
        return suggestions;
      }
    }
    return [];
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navbar */}
      <Navbar />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 300 }}
            >
              Test Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage Playwright test cases for your applications
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddingProject(true)}
            size="large"
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            Add Project
          </Button>
        </Box>

        {/* Add Project Dialog */}
        <Dialog
          open={isAddingProject}
          onClose={() => setIsAddingProject(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AddIcon color="primary" />
              Add New Project
            </Box>
          </DialogTitle>
          <form onSubmit={handleAddProject}>
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
                  setIsEditingTestCase(false);
                }}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => handleAddProject()}
                startIcon={<AddIcon />}
              >
                Add Project
              </Button>
            </DialogActions>
          </form>
        </Dialog>

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
              Add Test Case - {selectedProject?.url}
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

              <Typography variant="h6" gutterBottom>
                Test Steps
              </Typography>

              {/* Improved Help Section */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>💡 Selector Tips:</strong>
                  <br />• Use specific selectors:{" "}
                  <code>input[name="email"]</code>,{" "}
                  <code>button[type="submit"]</code>
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
                    <IconButton
                      onClick={() => handleRemoveStep(index)}
                      disabled={testSteps?.length === 1}
                      color="error"
                      sx={{ mt: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <TextField
                      label={
                        step.action === "goto"
                          ? "URL *"
                          : // : step.action === "wait"
                          // ? "Milliseconds *"
                          step.action.includes("expect")
                          ? "Selector *"
                          : "Selector *"
                      }
                      value={step.field}
                      onChange={(e) =>
                        handleStepChange(index, "field", e.target.value)
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

              <Button
                startIcon={<AddIcon />}
                onClick={handleAddStep}
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
              <Button></Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Projects List */}
        {data?.count === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              bgcolor: "grey.50",
              border: "2px dashed",
              borderColor: "grey.300",
            }}
          >
            <TestIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No projects yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first project to start building Playwright test cases
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setIsAddingProject(true)}
              size="large"
            >
              Add Your First Project
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {data?.results?.map((project) => (
              <Grid item xs={12} key={project?.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {project?.name}
                        </Typography>
                        <Typography variant="body" component="h4" gutterBottom>
                          {project?.description}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ mb: 1 }}
                        >
                          {project?.url}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Chip
                            label={`${project?.testcases?.length} test cases`}
                            size="small"
                          />
                          <Chip
                            label={project?.created_at}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddTestCase(project)}
                        size="small"
                      >
                        Add Test Case
                      </Button>
                      <Tooltip title="Upload JSON file">
                        <Button
                          variant="contained"
                          sx={{
                            mx: 2,
                          }}
                          onClick={() => {
                            setIsAddingJson(true);
                            setSelectedProject(project);
                          }}
                          size="small"
                        >
                          <UploadFile />
                        </Button>
                      </Tooltip>

                      <Dialog
                        open={isAddingJson}
                        onClose={() => setIsAddingJson(false)}
                        maxWidth="md"
                        fullWidth
                      >
                        <DialogTitle>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
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
                          <Button
                            variant="contained"
                            component="label"
                            sx={{ mt: 2 }}
                          >
                            Select JSON File
                            <input
                              type="file"
                              accept=".json"
                              hidden
                              onChange={handleFileSelect}
                            />
                          </Button>
                          {selectedFile && (
                            <Typography sx={{ mt: 1 }}>
                              Selected file: {selectedFile.name}
                            </Typography>
                          )}
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={() => setIsAddingJson(false)}>
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            onClick={() => {
                              setIsAddingJson(true);
                              console.log("project", selectedProject);
                              handleUploadFile(selectedProject, testCaseName);
                            }}
                          >
                            {"Save Test Case"}
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </Box>

                    {/* Test Cases */}
                    {project?.testcases?.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Test Cases:
                        </Typography>
                        {project?.testcases?.map((testCase) => (
                          <Accordion key={testCase?.id}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  width: "100%",
                                }}
                              >
                                <Typography sx={{ flexGrow: 1 }}>
                                  {testCase?.name}
                                </Typography>
                                <Tooltip title="Upload CSV or Excel file">
                                  <Button
                                    variant="contained"
                                    component="label"
                                    size="small"
                                    sx={{ mx: 2 }}
                                  >
                                    <UploadFile />
                                    <input
                                      type="file"
                                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                      hidden
                                      onChange={handleExcelUpload}
                                    />
                                  </Button>
                                </Tooltip>
                                <EditIcon
                                  sx={{
                                    mx: 2,
                                  }}
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setSelectedTestCase(testCase);
                                    setTestCaseName(testCase.name);
                                    setTestSteps(
                                      testCase.steps.map((step) => ({
                                        action: step.action || "",
                                        field: step.selector || "",
                                        value: step.value || "",
                                      }))
                                    );
                                    setIsEditingTestCase(true);
                                  }}
                                />
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mr: 2,
                                  }}
                                >
                                  {testCase?.status === "passed" && (
                                    <CheckCircleIcon color="success" />
                                  )}
                                  {testCase?.status === "failed" && (
                                    <ErrorIcon color="error" />
                                  )}
                                  {/* <Chip
                                    label={testCase?.status}
                                    size="small"
                                    color={
                                      testCase?.status === "passed"
                                        ? "success"
                                        : testCase?.status === "failed"
                                        ? "error"
                                        : "default"
                                    }
                                  /> */}
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={
                                      runningTests.has(
                                        `${project?.id}-${testCase?.id}`
                                      ) ? (
                                        <CircularProgress
                                          size={16}
                                          color="inherit"
                                        />
                                      ) : (
                                        <PlayIcon />
                                      )
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRunTestCase(project, testCase);
                                    }}
                                    // disabled={isRunning || !uploadedFile}
                                  >
                                    {runningTests.has(
                                      `${project?.id}-${testCase?.id}`
                                    )
                                      ? "Running..."
                                      : "Run"}
                                  </Button>
                                </Box>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              {uploadedFile && (
                                <Typography sx={{ mt: 1 }}>
                                  Uploaded File: {uploadedFile.name}
                                </Typography>
                              )}
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                Test Steps:
                              </Typography>
                              {testCase.steps.map((step, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    mb: 1,
                                    p: 1,
                                    bgcolor: "grey.50",
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      minWidth: 60,
                                      color: "text.secondary",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {idx + 1}.
                                  </Typography>
                                  <Chip
                                    label={step.action}
                                    size="small"
                                    color="primary"
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: "monospace",
                                      bgcolor: "white",
                                      px: 1,
                                      borderRadius: 0.5,
                                    }}
                                  >
                                    {step.field}
                                  </Typography>
                                  {step.value && (
                                    <Typography
                                      variant="body2"
                                      color="success.main"
                                      sx={{ fontFamily: "monospace" }}
                                    >
                                      "{step.value}"
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                              {testCase.result && (
                                <Box
                                  sx={{
                                    mt: 2,
                                    p: 2,
                                    bgcolor:
                                      testCase.status === "passed"
                                        ? "success.light"
                                        : "error.light",
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Result:{" "}
                                    {testCase.result.message ||
                                      "Test completed"}
                                  </Typography>
                                  {testCase.lastRun && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Run at:{" "}
                                      {new Date(
                                        testCase.lastRun
                                      ).toLocaleString()}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

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
