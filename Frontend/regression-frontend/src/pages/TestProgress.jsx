import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button, CircularProgress, Typography, LinearProgress, Box } from "@mui/material";
import { useGetTaskStatusQuery } from "../services/runTestCases.api.services";
import { toast } from "react-toastify";

const TestCaseProgress = () => {
  const { id } = useParams();

  // Keep track if toast has been shown
  const toastShown = useRef(false);
  const [polling, setPolling] = useState(true);
 
  const { data } = useGetTaskStatusQuery(id, {skip:!id,
    pollingInterval: polling ? 10000 : 0,
  });


  useEffect(() => {
    if (data?.status === "completed") {
      setPolling(false); // stop polling
      if (!toastShown.current) {
        toast.success("Test completed!");
        toastShown.current = true;
      }
    }
  }, [data]);


  const progressValue = data?.progress
    ? parseInt(data.progress.replace("%", ""), 10)
    : 0;

  const downloadResult = () => {
    if (data?.result_file) {
      const link = document.createElement("a");
      link.href = "http://127.0.0.1:8000" + data?.result_file;
      link.setAttribute("download", "results.xlsx"); // or get file name from URL if needed
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      toast.error("Result file not available yet!");
    }
  };

  return (
    <div className="p-4">
      <Typography variant="h5" gutterBottom>
        Test Run Progress
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography>Status: {data?.status || "loading..."}</Typography>
        {data?.status === "running" && <CircularProgress size={20} />}
      </Box>

      <Box mb={2}>
        <Typography gutterBottom>Progress: {progressValue}%</Typography>
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>

      <Button
        variant="contained"
        disabled={data?.status !== "completed"}
        onClick={downloadResult}
      >
        {data?.status === "completed" ? "Download Result" : "Waiting..."}
      </Button>
    </div>
  );
};

export default TestCaseProgress;
