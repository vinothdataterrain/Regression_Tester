import { api, rtkQueryServiceTags } from "./api";
const {TEST_CASE} = rtkQueryServiceTags;

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
      invalidatesTags: [TEST_CASE]
    }),

    editTestCase: builder.mutation({
      query: ({id, data}) => ({
        url: `/testcases/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [TEST_CASE]
    }),

    runTestCase: builder.mutation({
      query: ({ id }) => ({
        url: `/testcases/${id}/run/`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useCreateProgramMutation,
  useCreateProjectMutation,
  useGetProjectsQuery,
  useCreateTestCaseMutation,
  useRunTestCaseMutation,
  useEditTestCaseMutation,
} = ProjectFeed;
