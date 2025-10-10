import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { FileDownload, Visibility } from '@mui/icons-material';
import { DOMAIN } from '../../utils/constant';

const TestHistoryGrid = ({data}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
     
      setRows(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (reportPath) => {
    const url = `${DOMAIN}/media/${reportPath}`
    window.open(url,"_blank");
  };


  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'test_name',
      headerName: 'Test Name',
      width: 200,
      flex: 1
    },
    {
      field: 'project',
      headerName: 'Project',
      width: 150,
      renderCell: (params) =>{
        return <div>{params.row?.additional_info?.project}</div>
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const statusColors = {
          completed: 'success',
          failed: 'error',
          running: 'warning',
          pending: 'default'
        };
        
        return (
          <Chip
            label={params.value}
            color={statusColors[params.value] || 'default'}
            size="small"
            sx={{ textTransform: 'capitalize' }}
          />
        );
      }
    },
    {
      field: 'user_name',
      headerName: 'User',
      width: 130
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      width: 180,
      renderCell: (params) => {
        const value = params.value;
        if (!value) return "";
        const cleaned = value.replace(/\.\d+Z$/, "Z"); 
        return <div>{new Date(cleaned).toLocaleString()}</div>;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const reportPath = params.row.additional_info?.report;
        
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {reportPath && (
              <>
                
                <Tooltip title="Download Report">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleDownloadReport(reportPath)}
                  >
                    <FileDownload fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        );
      }
    }
  ];

  return (
    <Box sx={{ maxHeight: 600, width: '100%' }} className="m-3">
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        disableSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none'
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      />
    </Box>
  );
};

export default TestHistoryGrid;