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
        url: "/projects/",
        method: "GET",
      }),
    }),

    createTestCase: builder.mutation({
      query: (testCaseData) => ({
        url: `/testcases/`,
        method: "POST",
        body: testCaseData,
      }),
    }),

    runTestCase: builder.mutation({
      query: ({id}) => ({
        url: `/testcases/${id}/run/`,
        method: "POST",
      }),
    }),
  }),
});

export const { useCreateProjectMutation, useGetProjectsQuery, useCreateTestCaseMutation, useRunTestCaseMutation } = ProjectFeed;
