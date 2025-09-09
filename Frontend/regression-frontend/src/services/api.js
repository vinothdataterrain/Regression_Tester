import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = "https://wtf6tv6m-8000.inc1.devtunnels.ms/api"; // adjust if backend port differs

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
  }),
  tagTypes: [LOGIN, PROJECT, TEST_CASE, TEST_RESULT, USER],
  endpoints: () => ({}),
});
