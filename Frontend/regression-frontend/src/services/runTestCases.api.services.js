import { api } from "./api";

export const ProjectFeed = api.injectEndpoints({
  endpoints: (builder) => ({
    CreateProject: builder.mutation({
      query: (data) => ({
        url: "/projects/",
        method: "POST",
        body: data,
      }),
    }),

    getProjects: builder.query({
      query: () => ({
        url: "/get/projects",
        method: "GET",
      }),
    }),

    createTestCase: builder.mutation({
      query: ({ projectId, testCaseData }) => ({
        url: `/projects/${projectId}/test-cases`,
        method: "POST",
        body: testCaseData,
      }),
    }),

    runTestCase: builder.mutation({
      query: (payload) => ({
        url: "/run-test",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const { useCreateProjectMutation, usegetProjectsQuery, usecreateTestCaseMutation, userunTestCaseMutation } = ProjectFeed;
