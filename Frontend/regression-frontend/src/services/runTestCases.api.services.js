import { TestCache } from "@mui/x-data-grid/internals";
import { api, rtkQueryServiceTags } from "./api";
const { TEST_CASE, PROJECT, GROUP } = rtkQueryServiceTags;

export const ProjectFeed = api.injectEndpoints({
  endpoints: (builder) => ({
    CreateProject: builder.mutation({
      query: (data) => ({
        url: "/projects/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [PROJECT],
    }),

    updateProject: builder.mutation({
      query: ({ id, data }) => ({
        url: `/projects/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [PROJECT],
    }),

    getProjects: builder.query({
      query: () => ({
        url: "/projects/",
        method: "GET",
      }),
      providesTags: [PROJECT],
    }),

    getProjectbyId: builder.query({
      query: (id) => ({
        url: `/projects/${id}/`,
        method: "GET",
      }),
      providesTags: [TEST_CASE, GROUP],
    }),
    createProgram: builder.mutation({
      query: (data) => ({
        url: `/programs`,
        method: "POST",
        body: data,
      }),
    }),

    createGroup: builder.mutation({
      query: (data) => ({
        url: `/groups/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [GROUP],
    }),

    getGroups: builder.query({
      query: (id) => ({
        url: `/groups/`,
        method: "GET",
        params: { project: id },
      }),
      providesTags: [GROUP],
    }),

    runGroup: builder.mutation({
      query: ({ id }) => ({
        url: `/groups/${id}/run/`,
        method: "POST",
      }),
    }),

    createTestCase: builder.mutation({
      query: (data) => ({
        url: `/testcases/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TEST_CASE, GROUP],
    }),

    editTestCase: builder.mutation({
      query: ({ id, data }) => ({
        url: `/testcases/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [TEST_CASE, GROUP],
    }),

    deleteTestCase: builder.mutation({
      query: (id) => ({
        url: `/testcases/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [TEST_CASE, GROUP],
    }),

    getTaskStatus: builder.query({
      query: (id) => `/testcases/${id}/task-status/`,
    }),
    getAllTaskStatus: builder.query({
      query: (params) => ({
        url: `/testcases/all-task-status/`,
        params,
      }),
    }),
    getAllReports: builder.query({
      query: (params) => ({
        url: `/testcases/reports/`,
        method: "GET",
        params,
      }),
    }),
    runTestCase: builder.mutation({
      query: ({ id, file }) => ({
        url: `/testcases/${id}/run/`,
        method: "POST",
        body: file,
        // responseHandler: async (response) => {
        //   if (!response.ok) {
        //     throw new Error("Network response was not ok");
        //   }
        //   return  file ?  await response.blob() : response; // Convert response to Blob
        // },
      }),
    }),

    getSummary: builder.query({
      query: () => ({
        url: "/summary",
        method: "GET",
      }),
    }),

    runPythonScripts: builder.mutation({
      query: (data) => ({
        url: "/run-python-scripts",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateProgramMutation,
  useCreateProjectMutation,
  useCreateGroupMutation,
  useGetGroupsQuery,
  useRunGroupMutation,
  useGetAllTaskStatusQuery,
  useGetProjectsQuery,
  useGetTaskStatusQuery,
  useGetAllReportsQuery,
  useCreateTestCaseMutation,
  useRunTestCaseMutation,
  useEditTestCaseMutation,
  useDeleteTestCaseMutation,
  useGetSummaryQuery,
  useRunPythonScriptsMutation,
  useUpdateProjectMutation,
  useGetProjectbyIdQuery,
} = ProjectFeed;
