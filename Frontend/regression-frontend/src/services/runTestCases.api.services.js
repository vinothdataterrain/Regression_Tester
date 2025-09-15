import { api, rtkQueryServiceTags } from "./api";
const { TEST_CASE } = rtkQueryServiceTags;

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
    createProgram: builder.mutation({
      query: (data) => ({
        url: `/programs`,
        method: "POST",
        body: data,
      }),
    }),

    createTestCase: builder.mutation({
      query: (data) => ({
        url: `/testcases/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TEST_CASE],
    }),

    editTestCase: builder.mutation({
      query: ({ id, data }) => ({
        url: `/testcases/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [TEST_CASE],
    }),

    getTaskStatus: builder.query({
      query: (id)=> `/testcases/${id}/task-status/`
    }),
    getAllTaskStatus: builder.query({
      query: ()=> `/testcases/all-task-status/`
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
      })
    }),

    runPythonScripts : builder.mutation({
      query: ( data ) => ({
          url: "/run-python-scripts",
          method: "POST",
          body: data,
      })
    })
  }),
});

export const {
  useCreateProgramMutation,
  useCreateProjectMutation,
  useGetAllTaskStatusQuery,
  useGetProjectsQuery,
  useGetTaskStatusQuery,
  useCreateTestCaseMutation,
  useRunTestCaseMutation,
  useEditTestCaseMutation,
  useGetSummaryQuery,
  useRunPythonScriptsMutation,
} = ProjectFeed;
