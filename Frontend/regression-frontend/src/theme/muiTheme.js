import { createTheme, responsiveFontSizes } from "@mui/material";

let MuiTheme = createTheme({
    palette: {
    primary: {
      main: "#1D5BBF", // Main action color (buttons, links)
    },
    secondary: {
      main: "#6C757D", // For less prominent UI elements
    },
    background: {
      default: "#F8F9FA", // Light gray background
      paper: "#FFFFFF",   // White paper elements like cards
    },
    text: {
      primary: "#212529",
      secondary: "#495057",
    },
  },
  typography: {
    fontFamily: ["Plus Jakarta Sans", "sans-serif"].join(","),
  },
  components: {
    MuiDataGrid: {
      defaultProps: {
        disableRowSelectionOnClick: true,
        sx: {
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#1D5BBF0D",
            
          },
          "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
        },
        slotProps: {
          loadingOverlay: {
            variant: "skeleton",
            noRowsVariant: "skeleton",
          },
        },
        autoHeight: true,
        localeText: {
          noRowsLabel: "No Data",
        },
      },
    },
  },
});

export default MuiTheme = responsiveFontSizes(MuiTheme);
