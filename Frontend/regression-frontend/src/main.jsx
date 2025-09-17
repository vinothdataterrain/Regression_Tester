import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.jsx";
import { store } from "./store/store.js";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "@mui/material/styles";
import muiTheme from "./theme/muiTheme.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <Provider store={store}>
        <ToastContainer position="top-right" autoClose={5000} />
        <App />
      </Provider>
    </ThemeProvider>
  </StrictMode>
);
