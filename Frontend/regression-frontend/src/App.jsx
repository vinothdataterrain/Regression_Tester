import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";
import TooltipProvider from "./provider/tooltipProvider";

function App() {
  return (
    <TooltipProvider>
    <BrowserRouter>
      <div>
        <AppRoutes />
      </div>
    </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
