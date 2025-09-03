import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = "https://pbkzt3vt-8000.usw2.devtunnels.ms/api"; // adjust if backend port differs

export const rtkQueryServiceTags = {
  LOGIN: "Login",
  PROJECT: "Project",
  TEST_CASE: "TestCase",
  TEST_RESULT: "TestResult",
  USER: "User",
};

const { LOGIN, PROJECT, TEST_CASE, TEST_RESULT, USER } = rtkQueryServiceTags;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    credentials: "include", // Important for CORS
    prepareHeaders: (headers, { getState }) => {
      headers.set("Content-Type", "application/json");
      // Add any auth tokens if needed
      return headers;
    },
  }),
  tagTypes: [LOGIN, PROJECT, TEST_CASE, TEST_RESULT, USER],
  endpoints: () => ({}),
});
