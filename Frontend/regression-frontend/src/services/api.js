import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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
};

const { LOGIN, PROJECT, TEST_CASE, TEST_RESULT, USER, ADD_MEMBER, TEAM_MEMBERS, GROUP } = rtkQueryServiceTags;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) =>{
      const token = localStorage.getItem("access_token"); // or from state
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: [LOGIN, PROJECT, TEST_CASE, TEST_RESULT, USER, ADD_MEMBER, TEAM_MEMBERS, GROUP],
  endpoints: () => ({}),
});

export const { reducerPath, reducer, middleware, util } = api;
