import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE = "http://127.0.0.1:8000/api"; // adjust if backend port differs

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
    prepareHeaders: (headers) =>{
      const token = localStorage.getItem("access_token"); // or from state
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: [LOGIN, PROJECT, TEST_CASE, TEST_RESULT, USER],
  endpoints: () => ({}),
});
