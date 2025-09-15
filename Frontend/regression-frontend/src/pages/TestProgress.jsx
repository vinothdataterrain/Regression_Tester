import { Box, Button, Divider, LinearProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useGetTaskStatusQuery } from "../services/runTestCases.api.services";


export const TestCaseProgress = ( ) => {
  const params = useParams();
  const [progress, setProgress] = useState(0);
  const [status,SetStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const testid = params.id;
  const {data,} = useGetTaskStatusQuery(testid,{skip:!testid, refetchOnMountOrArgChange:true});

  useEffect(()=>{
   SetStatus(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  // Poll backend every 2s for progress
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        //const res = await fetch("/api/progress/"+testId);
        const data = progress+10;
        setProgress(data); // backend should return { "progress": 45 }
        if (data.progress >= 100) {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // File download handler
  const handleDownload = async () => {
    try {
      const res = await fetch("/api/download/", {
        method: "GET",
      });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "test-report.zip"; // or .json, .xlsx, etc.
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box 
     sx={{ width: '100%', textAlign: 'center', p: 2 }}>
      <Typography variant="h6" >Test Case Progress</Typography>
      <LinearProgress
        variant={progress.status === "completed" ? "determinate" : "indeterminate"}
        value={progress.percentage}
        sx={{ my: 2 }}
      />
      <Typography>
        {progress?.status === "completed"
          ? "Completed!"
          : "Running..."}
      </Typography>
      {!loading && (
        <Button variant="contained" onClick={handleDownload} href={progress.fileUrl} download="results.xlsx">
        {loading ? "Waiting for Completion..." : "Download Report"}
        </Button>
      )}
      <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f0f6ff",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          m:3,
          boxShadow: 6,
          borderRadius: 4,
          p: 2,
        }}
      >
        <CardContent sx={{ textAlign: "start" }}>
          <Typography variant="h5" component="div" gutterBottom color="primary" fontWeight={600}>
            TestCase {status?.testcase_id} Report
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" gutterBottom>
            <strong>Status:</strong>{" "}
            <Box
              component="span"
              sx={{
                color: status?.status === "completed" ? "green" : "orange",
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {status?.status}
            </Box>
          </Typography>

          {status?.result_file ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ✅ Your report is ready to download.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ⏳ Report is still being generated...
            </Typography>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: "center", mt: 2 }}>
          {status?.result_file && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                py: 1.2,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
              }}
              component="a"
              href={`http://127.0.0.1:8000/${status?.result_file}`}
              download
            >
              📥 Download Report
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
    </Box>
  );
};
