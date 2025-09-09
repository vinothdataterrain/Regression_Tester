import { Box, Button, LinearProgress, Typography } from "@mui/material";

export const TestCaseProgress = ({ projectId, testCaseId }) => {
  const testId = `${projectId}-${testCaseId}`;
  const progress = testRunProgress[testId] || { percentage: 0, status: 'pending', fileUrl: null };

  return (
    <Box 
     sx={{ width: '100%', textAlign: 'center', p: 2 }}>
      <Typography variant="h6">Test Case Progress</Typography>
      <LinearProgress
        variant={progress.status === "completed" ? "determinate" : "indeterminate"}
        value={progress.percentage}
        sx={{ my: 2 }}
      />
      <Typography>
        {progress.status === "completed"
          ? "Completed!"
          : "Running..."}
      </Typography>
      {progress.status === "completed" && (
        <Button variant="contained" href={progress.fileUrl} download="results.xlsx">
          Download Results
        </Button>
      )}
    </Box>
  );
};
