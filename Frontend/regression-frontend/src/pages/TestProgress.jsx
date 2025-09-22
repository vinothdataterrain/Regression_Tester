import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  LinearProgress,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Container,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
  PlayArrow as RunningIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import {
  useGetAllTaskStatusQuery,
  useGetTaskStatusQuery,
} from "../services/runTestCases.api.services";
import { toast } from "react-toastify";
import { formatTableNullValues } from "../utils/constant";

const TestCaseProgress = () => {
  const { id } = useParams();
  const [formattedRow, setFormattedRow] = useState(null);

  // Keep track if toast has been shown
  const toastShown = useRef(false);
  const [polling, setPolling] = useState(true);

  const { data: ResultData, isLoading: isResultsLoading } =
    useGetAllTaskStatusQuery();

  const { data } = useGetTaskStatusQuery(id, {
    skip: !id,
    pollingInterval: polling ? 10000 : 0,
  });

  useEffect(() => {
    if (ResultData) {
      const FormattedRowData = formatTableNullValues(ResultData);
      setFormattedRow(FormattedRowData);
    }
  }, [ResultData]);

  useEffect(() => {
    if (data?.status === "completed") {
      setPolling(false); // stop polling
      if (!toastShown.current) {
        toast.success("Test completed!");
        toastShown.current = true;
      }
    }
  }, [data]);

   const ResultTableColumns = [
    {
      field: "testcase_id",
      headerName: "Test Case ID",
      flex: 1,
      id: 0,
      minWidth: 120,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer flex justify-start items-center h-full w-full">
            <Chip 
              label={`#${params?.row?.testcase_id}`} 
              size="small" 
              color={params?.row?.testcase_id === parseInt(id) ? "primary" : "default"}
            />
          </div>
        );
      },
    },
    {
      field: "name",
      headerName: "Test Case Name",
      flex: 2,
      id: 1,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer flex justify-start items-center h-full w-full">
            <Typography variant="body2" fontWeight="medium">
              {params?.row?.name ?? "..."}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "run_id",
      headerName: "Run ID",
      flex: 2,
      id: 2,
      minWidth: 150,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer flex justify-start items-center h-full w-full">
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                backgroundColor: 'grey.100',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              {params?.row?.run_id ?? "..."}
            </Typography>
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1.5,
      id: 3,
      minWidth: 140,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer flex justify-start items-center h-full w-full">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon(params?.row?.status)}
              <Chip
                label={params?.row?.status ?? "..."}
                size="small"
                color={getStatusColor(params?.row?.status)}
                variant={params?.row?.status === 'completed' ? 'filled' : 'outlined'}
              />
            </Box>
          </div>
        );
      },
    },
    {
      field: "progress",
      headerName: "Progress",
      flex: 1.5,
      id: 4,
      minWidth: 130,
      renderCell: (params) => {
        const progressValue = params?.row?.progress 
          ? parseInt(params.row.progress.replace('%', ''), 10) 
          : 0;
        return (
          <div className="cursor-pointer flex justify-start items-center h-full w-full">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{ width: 60, height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" fontWeight="medium">
                {params?.row?.progress ?? "0%"}
              </Typography>
            </Box>
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      id: 5,
      minWidth: 100,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer flex justify-center items-center h-full w-full">
            <Tooltip title={`Download ${params?.row?.name} Results`}>
              <span>
                <IconButton
                  onClick={() => downloadResult(params?.row?.result_file, params?.row?.name)}
                  disabled={params?.row?.status !== 'completed'}
                  size="small"
                  color="primary"
                >
                  <DownloadIcon />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const progressValue = data?.progress
    ? parseInt(data.progress.replace("%", ""), 10)
    : 0;

  const downloadResult = (resultFile, testName) => {
    if (resultFile) {
      const link = document.createElement("a");
      link.href = "http://127.0.0.1:8000" + resultFile;
      link.setAttribute("download", `${testName}_results.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Download started!");
    } else {
      toast.error("Result file not available yet!");
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircleIcon color="success" />;
      case "failed":
        return <ErrorIcon color="error" />;
      case "running":
        return <RunningIcon color="primary" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "failed":
        return "error";
      case "running":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Progress Section - Only show if ID is present */}
      {id && (
        <>
          <Card elevation={2} sx={{ mb: 4 }}>
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <RunningIcon color="primary" />
                Test Run Progress - Test Case #{id}
              </Typography>

              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Typography variant="h6" color="text.secondary">
                  Status: {data?.status || "loading..."}
                </Typography>
                {data?.status === "running" && <CircularProgress size={20} />}
                {data?.status && getStatusIcon(data.status)}
              </Box>

              <Box mb={3}>
                <Typography gutterBottom>Progress: {progressValue}%</Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressValue}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 6,
                    },
                  }}
                />
              </Box>

              <Button
                variant="contained"
                disabled={data?.status !== "completed"}
                onClick={() =>
                  downloadResult(data?.result_file, `testcase_${id}`)
                }
                startIcon={<DownloadIcon />}
                size="large"
                sx={{
                  minWidth: 160,
                  borderRadius: 2,
                }}
              >
                {data?.status === "completed"
                  ? "Download Result"
                  : "Waiting..."}
              </Button>
            </CardContent>
          </Card>

          <Divider sx={{ mb: 4 }}>
            <Chip label="All Test Results" />
          </Divider>
        </>
      )}

      {/* Results Table Section - Always show */}
      <Card elevation={2}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" component="h2">
              {id ? "All Test Results" : "Test Case Results"}
            </Typography>
            <Chip
              label={`${ResultData?.length || 0} Results`}
              color="primary"
              variant="outlined"
            />
          </Box>

          {isResultsLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading results...</Typography>
            </Box>
          ) : ResultData && ResultData.length > 0 ? (
            <DataGrid
              getRowId={(res) => res.testcase_id}
              rows={formattedRow}
              columns={ResultTableColumns}
            />
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight="200px"
              sx={{ color: "text.secondary" }}
            >
              <PendingIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No test results available
              </Typography>
              <Typography variant="body2">
                Run some test cases to see results here
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default TestCaseProgress;
