import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import TestPage from "../pages/TestPage";
import Dashboard from "../pages/dashboard";
import Navbar from "../components/Navbar";
import PythonExecutor from "../pages/pythonExecutor";
import TestCaseProgress from "../pages/TestProgress";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Navbar />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/tests" element={<TestPage />} />
      <Route path="/results" element={<TestCaseProgress />} />
      <Route path="/results/:id" element={<TestCaseProgress />} />
      <Route path="/pythonScripts" element={<PythonExecutor />} />
      </Route>
    </Routes>
  );
}
