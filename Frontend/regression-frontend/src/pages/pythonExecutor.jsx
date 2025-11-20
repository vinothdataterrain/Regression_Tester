import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack,
} from "@mui/material";
import {
  PlayArrow,
  Download,
  CheckCircle,
  Error,
  Schedule,
  Refresh,
  PhotoCamera,
  Visibility,
  Close,
  NavigateBefore,
  NavigateNext,
  GetApp,
  ExpandMore,
  Add,
  Folder,
  Description,
  Cancel,
  FolderOpen,
  Edit,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useRunPythonScriptsMutation } from "../services/runTestCases.api.services";
import {
  useCreateScriptMutation,
  useGetScriptProjectsQuery,
  useRunScriptMutation,
  useEditScriptMutation,
} from "../services/python_scripts_service";
import AddScriptProject from "../components/pythonExecutor/addProject";
import AddScriptDialog from "../components/pythonExecutor/addScript";
import { DOMAIN } from "../utils/constant";

export default function PlaywrightExecutorWithScreenshots() {
  const [script, setScript] = useState(null);
  const [result, setResult] = useState(null);
  const [timeout, setTimeout] = useState(60);
  const [autoScreenshots, setAutoScreenshots] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [screenshotIndex, setScreenshotIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [addproject, setAddProject] = useState(false);
  const [openProject, setOpenProject] = useState(null);
  const [addScript, setAddScript] = useState(false);
  const [updateScript, setUpdateScript] = useState(false);
  const [currentScript, setCurrentScript] = useState(null);
  const { data } = useGetScriptProjectsQuery();
  const [createScript, {error}] = useCreateScriptMutation();
  const [runScript, { error: runerror }] = useRunScriptMutation();
  const [editScript, {error : editerror}] = useEditScriptMutation();
  useEffect(() => {
    setProjects(data);
  }, [data]);
  const [runPythonScripts, { isLoading }] = useRunPythonScriptsMutation();

  const handleRunScript = async () => {
    if (!script.trim()) {
      alert("Script is required!");
      return;
    }

    setResult(null);

    try {
      const scriptData = {
        script: script,
        timeout: timeout,
        auto_screenshots: autoScreenshots,
      };

      const response = await runPythonScripts(scriptData).unwrap();
      setResult(response);
    } catch (err) {
      console.error("Execution error:", err);
      setResult({
        status: "failed",
        error: err.data?.error || err.message || "Script execution failed",
        logs: [`Error occurred: ${err.data?.error || err.message}`],
        screenshots: [],
      });
    }
  };

  const openScreenshotModal = (screenshot, index) => {
    setSelectedScreenshot(screenshot);
    setScreenshotIndex(index);
    setOpenModal(true);
  };

  const closeScreenshotModal = () => {
    setOpenModal(false);
    setSelectedScreenshot(null);
  };

  const handleOpenScript = () => {
    setAddScript(!addScript);
    setUpdateScript(false);
    setCurrentScript(null);
  };

  const navigateScreenshot = (direction) => {
    const screenshots = result?.screenshots || [];
    let newIndex;

    if (direction === "next") {
      newIndex = (screenshotIndex + 1) % screenshots.length;
    } else {
      newIndex =
        screenshotIndex === 0 ? screenshots.length - 1 : screenshotIndex - 1;
    }

    setScreenshotIndex(newIndex);
    setSelectedScreenshot(screenshots[newIndex]);
  };

  const downloadScreenshot = (screenshot, index) => {
    try {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${screenshot.data}`;
      link.download = `screenshot_${index + 1}_${screenshot.description.replace(
        /[^a-z0-9]/gi,
        "_"
      )}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download screenshot:", error);
    }
  };

  const downloadAllScreenshots = () => {
    if (!result?.screenshots?.length) return;

    result.screenshots.forEach((screenshot, index) => {
      setTimeout(() => {
        downloadScreenshot(screenshot, index);
      }, index * 500);
    });
  };

  const downloadLogs = () => {
    if (!result?.logs) return;

    const logContent = result.logs.join("\n");
    const blob = new Blob([logContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `playwright_execution_${new Date().getTime()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = () => {
    if (isLoading)
      return (
        <Refresh
          sx={{ animation: "spin 1s linear infinite", color: "primary.main" }}
        />
      );
    if (!result) return <Schedule color="disabled" />;
    if (result.status === "passed") return <CheckCircle color="success" />;
    return <Error color="error" />;
  };

  const getStatusSeverity = () => {
    if (result?.status === "passed") return "success";
    if (result?.status === "failed") return "error";
    return "info";
  };

  const toggleProject = (project) => {
    setOpenProject(openProject === project ? null : project);
  };

  const handleScriptRun = async (id) => {
    if (id) {
      await runScript(id);
      if (runerror) {
        console.warn("Error", runerror);
      }
    }
  };

  const handleScriptSubmit = async ({ name, script }) => {
    if (name && script) {
      const data = { name: name, script: script };
      const res = await createScript({ id: openProject.id, data }).unwrap();
      if (error) {
        console.log(error);
      }
      if (res) {
        handleOpenScript();
      }
    }
  };

  const handleEditScript = async ({name, script}) => {
    if(name && script && currentScript?.id) {
      const data = {name: name, script: script};
      const response = await editScript({id: currentScript?.id, data}).unwrap();
      if (editerror) {
        console.log(editerror);
      }
      if (response) {
        handleOpenScript();
      }
    }
  }

  return (
    <Box sx={{ p: 3, mx: "auto" }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Playwright Script Executor with Screenshots
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Run Python Playwright scripts and capture visual flow with screenshots
      </Typography>

      <Grid container spacing={3}>
        {/* Script Input Section */}
        <Grid item xs={12} xl={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="h2">
                  Python Playwright Script
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoScreenshots}
                        onChange={(e) => setAutoScreenshots(e.target.checked)}
                        size="small"
                      />
                    }
                    label="Auto Screenshots"
                  />
                  <TextField
                    label="Timeout"
                    type="number"
                    value={timeout}
                    onChange={(e) => setTimeout(parseInt(e.target.value))}
                    size="small"
                    sx={{ width: 100 }}
                    InputProps={{
                      endAdornment: (
                        <Typography variant="caption">sec</Typography>
                      ),
                    }}
                  />
                </Stack>
              </Box>

              <TextField
                multiline
                rows={10}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Write your Python Playwright script here..."
                fullWidth
                variant="outlined"
                sx={{
                  mb: 2,
                  "& .MuiInputBase-input": {
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                  },
                }}
              />

              <Button
                variant="contained"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PlayArrow />
                  )
                }
                onClick={handleRunScript}
                disabled={isLoading}
                fullWidth
                size="large"
              >
                {isLoading
                  ? "Running Script..."
                  : "Run Script with Screenshots"}
              </Button>

              {isLoading && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="primary">
                    <Refresh
                      sx={{
                        animation: "spin 1s linear infinite",
                        mr: 1,
                        verticalAlign: "middle",
                      }}
                    />
                    Script is running and capturing screenshots...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} xl={6}>
          {result && (
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getStatusIcon()}
                    <Typography variant="h6" fontWeight="bold">
                      {result.status === "passed" ? "SUCCESS" : "FAILED"}
                    </Typography>
                    {result.screenshot_count > 0 && (
                      <Chip
                        icon={<PhotoCamera />}
                        label={`${result.screenshot_count} screenshots`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  {result.execution_time && (
                    <Chip
                      label={`${result.execution_time.toFixed(2)}s`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Alert severity={getStatusSeverity()} sx={{ mb: 2 }}>
                  {result.message}
                </Alert>

                {/* Screenshots Section */}
                {result.screenshots && result.screenshots.length > 0 && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PhotoCamera />
                        <Typography variant="h6">
                          Screenshots ({result?.screenshots?.length})
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mb: 2,
                        }}
                      >
                        <Button
                          startIcon={<Download />}
                          onClick={downloadAllScreenshots}
                          size="small"
                          variant="outlined"
                        >
                          Download All
                        </Button>
                      </Box>

                      <ImageList sx={{ maxHeight: 400 }} cols={2} gap={8}>
                        {result.screenshots.map((screenshot, index) => (
                          <ImageListItem
                            key={index}
                            sx={{
                              cursor: "pointer",
                              "&:hover": { opacity: 0.8 },
                            }}
                            onClick={() =>
                              openScreenshotModal(screenshot, index)
                            }
                          >
                            <img
                              src={`${DOMAIN}/${screenshot.url}`}
                              alt={screenshot.description}
                              loading="lazy"
                              style={{ height: 120, objectFit: "cover" }}
                            />
                            <ImageListItemBar
                              title={screenshot.description}
                              actionIcon={
                                <Tooltip title="View Full Size">
                                  <IconButton
                                    sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                              }
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Error Display */}
                {result.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Error:
                    </Typography>
                    <Typography variant="body2">{result.error}</Typography>
                  </Alert>
                )}

                {/* Execution Logs */}
                {result.logs && result.logs.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="h6">
                        Execution Logs ({result.logs.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mb: 1,
                        }}
                      >
                        <Button
                          startIcon={<Download />}
                          onClick={downloadLogs}
                          size="small"
                          variant="outlined"
                        >
                          Download Logs
                        </Button>
                      </Box>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: "#1a1a1a",
                          color: "#00ff00",
                          fontFamily: "monospace",
                          fontSize: "0.75rem",
                          maxHeight: 300,
                          overflow: "auto",
                        }}
                      >
                        {result.logs.map((log, index) => (
                          <Typography
                            key={index}
                            variant="body2"
                            sx={{ mb: 0.5, fontFamily: "monospace" }}
                          >
                            {log}
                          </Typography>
                        ))}
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          )}

          {/* Initial State */}
          {!result && !isLoading && (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                border: "2px dashed",
                borderColor: "grey.300",
                bgcolor: "grey.50",
              }}
            >
              <PhotoCamera sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Ready to capture your test flow
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Run script to see screenshots of each step
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Screenshot Modal */}
      <Dialog
        open={openModal}
        onClose={closeScreenshotModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6">
                Screenshot {screenshotIndex + 1} of{" "}
                {result?.details?.screenshots?.length || 1}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedScreenshot?.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedScreenshot &&
                  new Date(selectedScreenshot.timestamp).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Download Screenshot">
                <IconButton
                  onClick={() =>
                    downloadScreenshot(selectedScreenshot, screenshotIndex)
                  }
                  color="primary"
                >
                  <GetApp />
                </IconButton>
              </Tooltip>
              <IconButton onClick={closeScreenshotModal}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ position: "relative", textAlign: "center" }}>
            {selectedScreenshot && (
              <img
                src={`${DOMAIN}${selectedScreenshot.url}`}
                alt={selectedScreenshot.description}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            )}

            {/* Navigation buttons */}
            {result?.screenshots?.length > 1 && (
              <>
                <IconButton
                  onClick={() => navigateScreenshot("prev")}
                  sx={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  }}
                >
                  <NavigateBefore />
                </IconButton>
                <IconButton
                  onClick={() => navigateScreenshot("next")}
                  sx={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  }}
                >
                  <NavigateNext />
                </IconButton>
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ justifyContent: "space-between", bgcolor: "grey.50" }}
        >
          <Typography variant="caption" color="text.secondary">
            <strong>URL:</strong> {selectedScreenshot?.url}
          </Typography>
          <Button onClick={closeScreenshotModal}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Tips Section */}
      <Paper
        sx={{
          mt: 4,
          p: 3,
          bgcolor: "primary.50",
          borderLeft: 4,
          borderColor: "primary.main",
        }}
      >
        <Typography variant="h6" color="primary.main" gutterBottom>
          📸 Screenshot Tips:
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2" color="primary.dark">
            • Use <code>take_screenshot(page, "description")</code> to capture
            specific moments
          </Typography>
          <Typography variant="body2" color="primary.dark">
            • Enable "Auto Screenshots" to capture after major actions
            automatically
          </Typography>
          <Typography variant="body2" color="primary.dark">
            • Download individual screenshots or all at once for documentation
          </Typography>
        </Stack>
      </Paper>
      <Dialog
        open={addproject}
        onClose={() => setAddProject(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <AddScriptProject addedProject={() => setAddProject(false)} />
        </DialogContent>
      </Dialog>
      <AddScriptDialog
        open={addScript || updateScript}
        handleClose={handleOpenScript}
        projectId={openProject}
        script={currentScript}
        onSubmit={addScript ? handleScriptSubmit : handleEditScript}
      />
      <div className="p-6">
        <button
          onClick={() => setAddProject(true)}
          className="px-4 py-2 mb-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
        >
          + Add Project
        </button>

        <h3 className="text-2xl font-bold mb-6">📂 Script Projects</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 ">
          {projects?.map((proj) => (
            <div
              key={proj.id}
              className=" rounded-md shadow-md  w-50  hover:shadow-lg transition-shadow duration-300"
            >
              {/* Project Header */}
              <div
                className={`flex items-center  justify-between p-4 rounded border h-full border-gray-300 cursor-pointer ${
                  openProject === proj
                    ? "bg-gradient-to-r from-gray-100 to-gray-300"
                    : "bg-gradient-to-r from-gray-50 to-gray-200"
                } `}
                onClick={() => toggleProject(proj)}
              >
                <div className="flex items-center h-full justify-between gap-2 w-full">
                  {openProject === proj ? (
                    <FolderOpen
                      className="text-yellow-700 size-10"
                      sx={{ fontSize: "50px" }}
                    />
                  ) : (
                    <Folder
                      className="text-yellow-600 "
                      sx={{ fontSize: "50px" }}
                    />
                  )}
                  <div className="flex-col justify-evenly items-start">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {proj?.name}
                    </h2>
                    <p className="text-sm text-gray-500 w-10 truncate">
                      {proj?.description}
                    </p>
                    <span>
                      <Chip
                        label={`${proj?.testcases.length} test cases`}
                        size="small"
                        sx={{
                          backgroundColor: "#e0f2fe", // Tailwind blue-100
                          color: "#0366c4", // Tailwind blue-800
                          fontWeight: "500",
                          border: "1px solid #0366c4",
                          borderRadius: "15px",
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {openProject && (
          <div className="my-4 bg-white shadow-md rounded-lg overflow-hidden">
            {/* Project Header */}
            <div className="flex items-center justify-between p-4  bg-indigo-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {openProject?.name}
                </h2>
                <p className="text-gray-500 text-sm">
                  {openProject?.description}
                </p>
              </div>
              <button
                onClick={() => {
                  setAddScript(true);
                  setCurrentScript(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700 transition"
              >
                + Add Script
              </button>
            </div>

            {/* Test Cases Section */}
            <div className="p-4">
              <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Description className="text-indigo-500" fontSize="small" />
                Test Cases
                <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                  {openProject?.testcases.length}
                </span>
              </h3>

              <div className="space-y-4">
                {openProject?.testcases.map((tc) => (
                  <div
                    key={tc?.id}
                    className="p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Accordion>
                      {/* Test Case Header */}
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Description
                              className="text-indigo-500"
                              fontSize="small"
                            />
                            <span className="font-medium text-gray-800" data-tooltip={tc?.name}>
                              {tc?.name}
                            </span>
                            <Edit
                              className="text-blue-500"
                              style={{ fontSize: 20 }}
                              onClick={() => {
                                setUpdateScript(true);
                                setCurrentScript(tc);
                              }}
                            />
                            <div
                              className=" bg-blue-300 rounded-xl"
                              onClick={() => handleScriptRun(tc.id)}
                            >
                              <PlayArrow />
                            </div>
                          </div>
                        </div>
                      </AccordionSummary>

                      <AccordionDetails>
                        {/* Script */}
                        <pre className="bg-gray-100 p-3 rounded text-sm text-gray-700 mb-3 overflow-auto max-h-[300px]">
                          {tc?.script}
                        </pre>
                      </AccordionDetails>
                    </Accordion>

                    {/* Results */}
                    <h4 data-tooltip="results from testcase" className="font-semibold text-sm text-gray-700 mb-1">
                      Results:
                    </h4>
                    <ul className="space-y-2">
                      {tc.results.map((res) => (
                        <div>
                          <li
                            key={res.id}
                            className="flex items-center gap-2 text-sm p-2 rounded-md bg-gray-50"
                          >
                            {res.status === "passed" ? (
                              <CheckCircle
                                className="text-green-600"
                                fontSize="small"
                              />
                            ) : (
                              <Cancel
                                className="text-red-600"
                                fontSize="small"
                              />
                            )}
                            <span
                              className={`font-bold ${
                                res.status === "passed"
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              {res.status.toUpperCase()}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(res.created_at).toLocaleString()}
                            </span>
                          </li>
                          {res?.details.logs &&
                            res?.details.logs.length > 0 && (
                              <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                  <Typography variant="h6">
                                    Execution Logs ({res.details.logs.length})
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      mb: 1,
                                    }}
                                  >
                                    <Button
                                      startIcon={<Download />}
                                      onClick={downloadLogs}
                                      size="small"
                                      variant="outlined"
                                    >
                                      Download Logs
                                    </Button>
                                  </Box>
                                  <Paper
                                    sx={{
                                      p: 2,
                                      bgcolor: "#1a1a1a",
                                      color: "#00ff00",
                                      fontFamily: "monospace",
                                      fontSize: "0.75rem",
                                      maxHeight: 300,
                                      overflow: "auto",
                                    }}
                                  >
                                    {res?.details.logs.map((log, index) => (
                                      <Typography
                                        key={index}
                                        variant="body2"
                                        sx={{
                                          mb: 0.5,
                                          fontFamily: "monospace",
                                        }}
                                      >
                                        {log}
                                      </Typography>
                                    ))}
                                  </Paper>
                                </AccordionDetails>
                              </Accordion>
                            )}
                            {res?.details.screenshots && res?.details.screenshots.length > 0 && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PhotoCamera />
                        <Typography variant="h6">
                          Screenshots ({res?.details.screenshots.length})
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mb: 2,
                        }}
                      >
                        <Button
                          startIcon={<Download />}
                          onClick={downloadAllScreenshots}
                          size="small"
                          variant="outlined"
                        >
                          Download All
                        </Button>
                      </Box>

                      <ImageList sx={{ maxHeight: 400 }} cols={2} gap={8}>
                        {res?.details.screenshots.map((screenshot, index) => (
                          <ImageListItem
                            key={index}
                            sx={{
                              cursor: "pointer",
                              "&:hover": { opacity: 0.8 },
                            }}
                            onClick={() =>
                              openScreenshotModal(screenshot, index)
                            }
                          >
                            <img
                              src={`${DOMAIN}${screenshot.url}`}
                              alt={screenshot.description}
                              loading="lazy"
                              style={{ height: 120, objectFit: "cover" }}
                            />
                            <ImageListItemBar
                              title={screenshot.description}
                              actionIcon={
                                <Tooltip title="View Full Size">
                                  <IconButton
                                    sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                                  >
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                              }
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </AccordionDetails>
                  </Accordion>
                )}
                        </div>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
}
