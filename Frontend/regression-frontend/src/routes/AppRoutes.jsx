import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import TestPage from "../pages/TestPage";
import { TestCaseProgress } from "../pages/TestProgress";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tests" element={<TestPage />} />
      <Route path="/testProgress" element={<TestCaseProgress />} />
    </Routes>
  );
}
