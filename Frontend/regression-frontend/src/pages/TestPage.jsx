import React, { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import {
  useCreateTestCaseMutation,
  useEditTestCaseMutation,
  useGetProjectbyIdQuery,
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
  const [reportPath, setReportPath] = useState(null);
  
  const { success } = useToast();
  const theme = useTheme();
  const isMdscreen = useMediaQuery(theme.breakpoints.up("md"));
  const [testSteps, setTestSteps] = useState([
    { action: "", field: "", value: "" },
  ]);
  const [runningTests, setRunningTests] = useState(new Set());

  const [createTestCase] = useCreateTestCaseMutation();
  const [EditTestCase] = useEditTestCaseMutation();
  const [RunTestCase] = useRunTestCaseMutation();


  const {data , isLoading, error } = useGetProjectbyIdQuery(projectId);
 
  // Set the current project directly from API response
  useEffect(() => {
    if (data) {
      setCurrentProject(data);
      setSelectedProject(data);
    }
  }, [data]);


  const handleAddTestCase = (project) => {
    setSelectedProject(project);
    setIsAddingTestCase(true);
    setTestCaseName("");
    setTestSteps([{ action: "", field: "", value: "" }]);
  };

  const handleEditTestCase = async (testCase) => {
    try {
      const updatedTestcaseData = {
        project: selectedProject.id,
        name: testCaseName,
        steps:[  ...(stateOption === "use" && currentProject ? [{ action:"use", value: `${currentProject.name}.json` }] : []),
        ...testSteps.map((step) => ({
          action: step.action,
          selector: step.field,
          value: step.value || "",
          ...(step.url && {url: step.url})
        })),
       ...(stateOption === "save" && currentProject ? [{action:"save", value: `${currentProject.name}.json` }] : []),
        ]
      };
      await EditTestCase({
        id: testCase.id,
        data: updatedTestcaseData,
      }).unwrap();
      setSnackbar({
        open: true,
        message: "Test case updated successfully!",
        severity: "success",
      });

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
        steps:[  ...(stateOption === "use" && currentProject ? [{ action:"use", value: `${currentProject.name}.json` }] : []),
        ...testSteps.map((step) => ({
          action: step.action,
          selector: step.field,
          value: step.value || "",
          ...(step.url && {url: step.url})
        })),
       ...(stateOption === "save" && currentProject ? [{action:"save", value: `${currentProject.name}.json` }] : []),
        ]
      };
    
      await createTestCase(data).unwrap();

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
        setReportPath(response?.report);
        toast.success("Test case run completed!");
        setSnackbar({
          open: true,
          message: `test case ${
            response?.status === "completed" ? "passed" : "failed"
          }`,
          severity: `${response?.status === "completed" ? "success" : "error"}`,
        });
      }
    } catch (error) {
      console.error("Test execution failed:", error);
      toast.error("Failed to run test case");
    } finally {
      //setIsRunning(false);
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
        steps: [
          ...(stateOption === "use" && currentProject ? [{ action:"use", value: `${currentProject.name}.json` }] : []),
          ...PlaywrightFormat,
          ...(stateOption === "save" && currentProject ? [{action:"save", value: `${currentProject.name}.json` }] : []),
        ],
      };
      try {
        await createTestCase(payloadData).unwrap();
        setIsAddingTestCase(false);
        setIsAddingJson(false);
        setTestCaseName("");
        setSelectedFile(null);
        setStateOption(null);
      } catch (apiErr) {
        console.error("API error while creating test case:", apiErr);
      }
    } catch (err) {
      console.error("Failed to read or parse JSON file:", err);
    }
  };

  const handleDownloadReport = (reportPath) => {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
            Failed to load projects data. Error: {error?.message || 'Unknown error'}
          </Alert>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/projects')}
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
            onClick={() => navigate('/projects')}
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
      
        {/* Breadcrumb Navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link 
            underline="hover" 
            color="inherit" 
            onClick={() => navigate('/projects')}
            sx={{ cursor: 'pointer' }}
          >
            Projects
          </Link>
          <Typography color="text.primary">{currentProject?.name}</Typography>
        </Breadcrumbs>

        {/* Project Header */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent>
            <Box className="flex flex-col space-y-2 md:space-y-0 md:flex-row " sx={{  justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/projects')}
                    size="small"
                    className="!rounded-full !border !p-0 md:!p-1"
                    >
                   { isMdscreen && "Back"}
                  </Button>
                  <Typography variant="h6" component="h1" gutterBottom sx={{ margin: 0 }}>
                    {currentProject?.name}
                  </Typography>
                </Box>
                
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {currentProject?.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LanguageIcon color="primary" />
                    <Link 
                      href={currentProject?.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ textDecoration: 'none' }}
                    >
                      {currentProject?.url}
                    </Link>
                    <LaunchIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`${currentProject?.testcases?.length || 0} test cases`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={`Created: ${new Date(currentProject?.created_at).toLocaleDateString()}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddTestCase(currentProject)}
                  size="small"
                >
                  Add Test Case
                </Button>
                <Tooltip title="Upload JSON file">
                  <Button
                    variant="outlined"
                    startIcon={<UploadFile />}
                    onClick={() => {
                      setIsAddingJson(true);
                      setSelectedProject(currentProject);
                    }}
                    size="small"
                  >
                    Upload JSON
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ mb: 4 }} />

        {/* Test Cases Section */}
        <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 3 }}>
          Test Cases ({currentProject?.testcases?.length || 0})
        </Typography>

        {currentProject?.testcases?.length === 0 ? (
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <TestIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No test cases yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first test case to start automated testing for this project
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleAddTestCase(currentProject)}
                size="large"
              >
                Create First Test Case
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {currentProject?.testcases?.map((testCase) => (
              <Box
                key={testCase?.id}
                sx={{ 
                  width: '100%'
                }}
              >
                <Accordion 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&.MuiAccordion-root': {
                      '&:before': {
                        display: 'none'
                      }
                    }
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      minHeight: 64,
                      '&.Mui-expanded': {
                        minHeight: 64
                      }
                    }}
                  >
                    <Box
                    className="flex flex-col md:flex-row  justify-start md:justify-between"
                      sx={{
                       
                        alignItems: "center",
                        width: "100%",
                        minHeight: 40
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          flexGrow: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          pr: 1
                        }}
                        title={testCase?.name}
                      >
                        {testCase?.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                        {reportPath && !uploadedFile && (
                          <Tooltip title="Download HTML Report">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadReport(reportPath);
                              }}
                              color="primary"
                            >
                              <FileDownload />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Upload CSV or Excel file">
                          <Button
                            variant="outlined"
                            startIcon={<UploadFile />}
                            onClick={(e) => e.stopPropagation()}
                            //className="rounded-full min-w-4 mx-auto md:rounded-md"
                          >
                           {isMdscreen && "Upload Data"}
                            <input
                              type="file"
                              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                              hidden
                              onChange={handleExcelUpload}
                            />
                          </Button>
                        </Tooltip>
                        
                        <Tooltip title="Edit Test Case">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject(currentProject);
                              setSelectedTestCase(testCase);
                              setTestCaseName(testCase.name);
                              setTestSteps(
                                testCase.steps.map((step) => ({
                                  action: step.action || "",
                                  field: step.action === "goto" ? (step.url || "") : (step.selector || ""),
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
                        
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {testCase?.status === "passed" && (
                            <CheckCircleIcon color="success" />
                          )}
                          {testCase?.status === "failed" && (
                            <ErrorIcon color="error" />
                          )}
                          
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={
                              runningTests.has(`${currentProject?.id}-${testCase?.id}`) ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <PlayIcon />
                              )
                            }
                            className="p-1 w-8 md:w-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRunTestCase(currentProject, testCase);
                            }}
                          >
                            {isMdscreen && (runningTests.has(`${currentProject?.id}-${testCase?.id}`)
                              ? "Running..."
                              : "Run")}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails 
                    sx={{ 
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      pt: 2
                    }}
                  >
                    {uploadedFile && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Uploaded File: {uploadedFile.name}
                      </Alert>
                    )}
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Test Steps ({testCase.steps.length}):
                    </Typography>
                    
                    <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                      {testCase.steps.map((step, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            minHeight: 60,
                            gap: 1.5,
                            mb: 1,
                            p: 1.5,
                            bgcolor: "grey.50",
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            '&:last-child': {
                              mb: 0
                            }
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              minWidth: 30,
                              minHeight: 30,
                              color: "primary.main",
                              fontWeight: "bold",
                              textAlign: 'center',
                              fontSize: '0.75rem'
                            }}
                          >
                            {idx + 1}
                          </Typography>
                          
                          <Chip
                            label={step.action}
                            size="small"
                            color="primary"
                            sx={{ 
                              minWidth: 70,
                              fontSize: '0.7rem',
                              height: 30
                            }}
                          />
                          
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              bgcolor: "white",
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.5,
                              border: '1px solid',
                              borderColor: 'grey.300',
                              flexGrow: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.7rem'
                            }}
                            title={step.selector || step.field}
                          >
                            {step.selector || step.field}
                          </Typography>
                          
                          {step.value && (
                            <Typography
                              variant="caption"
                              color="success.main"
                              sx={{ 
                                fontFamily: "monospace",
                                fontWeight: 'medium',
                                fontSize: '0.7rem',
                                maxWidth: 100,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={step.value}
                            >
                              "{step.value}"
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                    
                    {testCase.result && (
                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          bgcolor: testCase.status === "passed" ? "success.light" : "error.light",
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Test Result:
                          </Typography>
                          {reportPath && !uploadedFile && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<FileDownload />}
                              onClick={() => handleDownloadReport(reportPath)}
                              sx={{ ml: 2 }}
                            >
                              Download Report
                            </Button>
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {testCase.result.message || "Test completed"}
                        </Typography>
                        {testCase.lastRun && (
                          <Typography variant="caption" color="text.secondary">
                            Run at: {new Date(testCase.lastRun).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Box>
            ))}
          </Box>
        )}

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
              {isEditingTestCase ? "Edit Test Case" : "Add Test Case"} - {selectedProject?.url}
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
                  <strong>Selector Tips:</strong>
                  <br />• Use specific selectors: <code>input[name="email"]</code>, <code>button[type="submit"]</code>
                  <br />• For buttons with text: <code>button:has-text("Login")</code>
                  <br />• Use IDs when available: <code>#login-btn</code>
                  <br />• For your login form try: <code>input[name="email"]</code>, <code>input[name="password"]</code>, <code>button[type="submit"]</code>
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
                          : "Selector *"
                      }
                      value={step.action === "goto" ? (step.url || "") : (step.field || "")}
                      onChange={(e) =>
                        handleStepChange(index, step.action === "goto" ? "url" : "field", e.target.value)
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
              <RadioGroup
          value={stateOption}
          onChange={(e) => setStateOption(e.target.value)}
        >
          <FormControlLabel value="null" control={<Radio />} label="No state" />
          <FormControlLabel value="save" control={<Radio />} label="Save state " />
          <FormControlLabel value="use" control={<Radio />} label="Use existing state" />
        </RadioGroup>
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
                  label="No state" 
                />
                <FormControlLabel 
                  value="save" 
                  control={<Radio />} 
                  label="Save state after test" 
                />
                <FormControlLabel 
                  value="use" 
                  control={<Radio />} 
                  label="Use existing state" 
                />
              </RadioGroup>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setIsAddingJson(false);
              setStateOption(null);
              setSelectedFile(null);
              setTestCaseName("");
            }}>
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