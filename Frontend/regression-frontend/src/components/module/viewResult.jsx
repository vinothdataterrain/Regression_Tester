import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { DOMAIN } from "../../utils/constant";
import {
  Close,
  Create,
  Description,
  Download,
  ExpandMore,
  Fullscreen,
  FullscreenExit,
  Image,
  Mouse,
  Navigation,
  PlayArrow,
  Schedule,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useEffect } from "react";

const ModuleResult = () => {
  const location = useLocation();
  const data = location.state || {};
  const resultData = data?.data;

  const [reportDialog, setReportDialog] = useState({
    open: "false",
    url: null,
    title: "",
  });
  const [videoDialog, setVideoDialog] = useState({
    open: "false",
    url: "",
    title: "",
  });
  const [imageDialog, setImageDialog] = useState({
    open: "false",
    url: "",
    title: "",
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [html, setHtml] = useState(null);
  const passedCount =
    resultData?.data?.results?.filter((res) => res.status === "passed")
      ?.length || 0;
  const failedCount =
    resultData?.data?.results?.filter((res) => res.status === "failed")
      ?.length || 0;
  const testcases = resultData?.data?.results;

  // Get video URL from results
  const getVideoUrl = (results) => {
    if (!results) return null;
    const videoItem = results.find((r) => r.video);
    return videoItem ? `${DOMAIN}${videoItem.video}` : null;
  };

  // Get all screenshots from results
  const getScreenshots = (results) => {
    if (!results) return [];
    return results
      .filter((r) => r.screenshot)
      .map((r) => ({
        url: `${DOMAIN}${r.screenshot}`,
        step: r.step_number,
        status: r.status,
      }));
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "goto":
        return <Navigation fontSize="small" />;
      case "click":
        return <Mouse fontSize="small" />;
      case "fill":
        return <Create fontSize="small" />;
      case "wait":
        return <Schedule fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "passed":
        return "success";
      case "failed":
        return "error";
      case "skipped":
        return "warning";
      default:
        return "default";
    }
  };

  const handleVideoOpen = (url, title) => {
    setVideoDialog({ open: true, url, title });
  };

  const handleImageOpen = (url, title) => {
    setImageDialog({ open: true, url, title });
  };

  const handleReportOpen = (url, title) => {
    setReportDialog({
      open: true,
      url: `${DOMAIN}/media/${url}`,
      title: title,
    });
    // if (url) {
    //   const report_path = `${DOMAIN}/media/${url}`;
    //   window.open(report_path, "_blank");
    // } else {
    //   toast.error("No report to display!");
    // }
  };

  const handleClose = () => {
    setVideoDialog({ open: false, url: "", title: "" });
    setImageDialog({ open: false, url: "", title: "" });
    setReportDialog({ open: false, url: "", title: "" });
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };
  useEffect(() => {
    if (!reportDialog?.url) return;

    const fetchReport = async () => {
      try {
        const response = await fetch(reportDialog?.url);
        if (!response.ok) throw new Error("Failed to load report");
        const htmlText = await response.text(); // convert ReadableStream to text
        setHtml(htmlText);
      } catch (err) {
        console.error(err);
      }
    };

    fetchReport();
  }, [reportDialog?.url]);

  return (
    <Container>
      <Card>
        <CardContent>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {resultData?.data?.group_name + " " + "Module Results"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" gutterBottom>
                        Total Test Cases
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {resultData?.data?.total_testcases || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" gutterBottom color="success.main">
                        Passed Testcases
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {passedCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" gutterBottom color="error.main">
                        Failed Testcases
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {failedCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ my: 3 }}>
        Testcases ({resultData?.data?.total_testcases})
      </Typography>
      {testcases.map((tc) => {
        const steps = tc?.result?.filter((r) => r.action) || [];
        const videoUrl = getVideoUrl(tc.result);
        const screenshots = getScreenshots(tc.result);
        return (
          <Accordion key={tc.testcase_id} sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
                  {tc.testcase_name}
                </Typography>
                <Chip
                  label={`#${tc.testcase_id}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip label={`${steps.length} steps`} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ mb: 3, flexWrap: "wrap" }}
                >
                  {tc.report && (
                    <Button
                      variant="outlined"
                      startIcon={<Description />}
                      onClick={() =>
                        handleReportOpen(tc.report, tc.testcase_name)
                      }
                      size="small"
                    >
                      View Report
                    </Button>
                  )}
                  {videoUrl && (
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      onClick={() =>
                        handleVideoOpen(videoUrl, tc.testcase_name)
                      }
                      size="small"
                      color="secondary"
                    >
                      Watch Video
                    </Button>
                  )}
                  {screenshots.length > 0 && (
                    <Badge badgeContent={screenshots.length} color="primary">
                      <Button
                        variant="outlined"
                        startIcon={<Image />}
                        onClick={() =>
                          handleImageOpen(screenshots[0]?.url, tc.testcase_name)
                        }
                        size="small"
                      >
                        Screenshots
                      </Button>
                    </Badge>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Testcase Steps
                </Typography>
                <Stepper orientation="vertical" sx={{ mt: 2 }}>
                  {steps.map((step, stepIndex) => (
                    <Step key={stepIndex} active={true}>
                      <StepLabel
                        StepIconComponent={() => (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              bgcolor:
                                step.status === "passed"
                                  ? "success.main"
                                  : "error.main",
                              color: "white",
                            }}
                          >
                            {getActionIcon(step.action)}
                          </Box>
                        )}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body1" fontWeight="medium">
                            Step {step.step_number}: {step.action.toUpperCase()}{" "}
                            - {step.selector}
                          </Typography>
                          <Chip
                            label={step.status}
                            size="small"
                            color={getStatusColor(step.status)}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Video Dialog */}
      {videoDialog.open && videoDialog.url && (
        <Dialog open={videoDialog.open} onClose={handleClose} maxWidth="lg">
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">
                {videoDialog.title || "Test Execution Video"}
              </Typography>
              <Box>
                <IconButton onClick={toggleFullscreen} sx={{ mr: 1 }}>
                  {fullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
                <IconButton onClick={handleClose}>
                  <Close />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {videoDialog.url ? (
              <video
                controls
                autoPlay
                style={{
                  width: "100%",
                  maxHeight: fullscreen ? "90vh" : "70vh",
                }}
                src={videoDialog.url}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <Typography>No video available.</Typography>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Image Dialog */}
      {imageDialog.open && imageDialog.url && (
        <Dialog
          open={imageDialog.open}
          onClose={handleClose}
          maxWidth="lg"
          fullWidth
          fullScreen={fullscreen}
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">
                {imageDialog.title || "Screenshot"}
              </Typography>
              <Box>
                <IconButton onClick={toggleFullscreen} sx={{ mr: 1 }}>
                  {fullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
                <IconButton onClick={handleClose}>
                  <Close />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {imageDialog.url ? (
              <Box
                component="img"
                src={imageDialog.url}
                alt="Screenshot"
                sx={{
                  width: "100%",
                  height: "auto",
                  maxHeight: fullscreen ? "90vh" : "70vh",
                  objectFit: "contain",
                  cursor: "zoom-in",
                }}
                onClick={toggleFullscreen}
              />
            ) : (
              <Typography>No screenshot available.</Typography>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Report Dialog */}
      {reportDialog.open && html && (
        <Dialog
          open={reportDialog.open}
          onClose={handleClose}
          maxWidth="lg"
          fullWidth
          fullScreen={fullscreen}
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">
                {reportDialog.title || "Test Report"}
              </Typography>
              <Box>
                <Button
                  startIcon={<Download />}
                  onClick={() => window.open(reportDialog.url, "_blank")}
                  sx={{ mr: 1 }}
                >
                  Open in New Tab
                </Button>
                <IconButton onClick={toggleFullscreen} sx={{ mr: 1 }}>
                  {fullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
                <IconButton onClick={handleClose}>
                  <Close />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <Typography>No report available.</Typography>
            )}

            {/* // <iframe
            //   key={reportDialog?.url}
            //   src={reportDialog.url}
            //   style={{
            //     width: "100%",
            //     height: fullscreen ? "90vh" : "70vh",
            //     border: "none",
            //   }}
            //   title="Test Report"
            // /> */}
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};

export default ModuleResult;
