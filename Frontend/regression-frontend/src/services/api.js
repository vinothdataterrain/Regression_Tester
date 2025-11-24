import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";

export const backend_url = import.meta.env.VITE_BASE_URL
export const baseUrl = `${backend_url}/api/`;

export const rtkQueryServiceTags = {
  LOGIN: "Login",
  PROJECT: "Project",
  TEST_CASE: "TestCase",
  TEST_RESULT: "TestResult",
  USER: "User",
  ADD_MEMBER: "AddMemeber",
  TEAM_MEMBERS: "TeamMembers",
  GROUP: "Group",
  SCRIPT_PROJECT: "ScriptProjects",
  SCRIPT: "Script",
};

const {
  LOGIN,
  PROJECT,
  TEST_CASE,
  TEST_RESULT,
  USER,
  ADD_MEMBER,
  TEAM_MEMBERS,
  GROUP,
  SCRIPT_PROJECT,
  SCRIPT,
} = rtkQueryServiceTags;

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    toast.error("Session expired!");
    localStorage.removeItem("access_token");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    LOGIN,
    PROJECT,
    TEST_CASE,
    TEST_RESULT,
    USER,
    ADD_MEMBER,
    TEAM_MEMBERS,
    GROUP,
    SCRIPT_PROJECT,
    SCRIPT,
  ],
  endpoints: () => ({}),
});

export const { reducerPath, reducer, middleware, util } = api;
