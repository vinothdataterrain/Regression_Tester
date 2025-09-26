import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import TestPage from "../pages/TestPage";
import Dashboard from "../pages/dashboard";
import Navbar from "../components/Navbar";
import PythonExecutor from "../pages/pythonExecutor";
import TestCaseProgress from "../pages/TestProgress";
import Project from "../pages/projects";
import SignUpPage from "../pages/signUp";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signUp" element={<SignUpPage />} />
      <Route element={<Navbar />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Project />} />
      <Route path="/projects/:projectId" element={<TestPage />} />
      <Route path="/results" element={<TestCaseProgress />} />
      <Route path="/results/:id" element={<TestCaseProgress />} />
      <Route path="/pythonScripts" element={<PythonExecutor />} />
      </Route>
    </Routes>
  );
}
