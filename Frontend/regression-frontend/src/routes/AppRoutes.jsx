import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import TestPage from "../pages/TestPage";
import Dashboard from "../pages/dashboard";
import Navbar from "../components/Navbar";
import PythonExecutor from "../pages/pythonExecutor";
import TestCaseProgress from "../pages/TestProgress";
import Project from "../pages/projects";
import SignUpPage from "../pages/signUp";
import Profile from "../pages/profile";
import ModuleResult from "../components/module/viewResult";

export default function AppRoutes() {
  const PrivateRoute = () => {
    const location = useLocation();
    const RedirectPath = `${location.pathname}`;
    const loggedIn = localStorage.getItem("access_token");

    return loggedIn ? (
      <Outlet />
    ) : (
      <Navigate to={`/login?redirect=${RedirectPath}`} />
    );
  };

  const PublicRoutes = () => {
    const loggedIn = !localStorage.getItem("access_token");
    return loggedIn ? <Outlet /> : <Navigate to="/dashboard" />;
  };
  return (
    <Routes>
      <Route element={<PublicRoutes />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signUp" element={<SignUpPage />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route element={<Navbar />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Project />} />
          <Route path="/projects/:projectId" element={<TestPage />} />
          <Route path="/results" element={<TestCaseProgress />} />
          <Route path="/results/:id" element={<TestCaseProgress />} />
          <Route path="/pythonScripts" element={<PythonExecutor />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects/view-result" element={<ModuleResult />} />
        </Route>
      </Route>
    </Routes>
  );
}
