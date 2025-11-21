import { api, rtkQueryServiceTags } from "./api";
const { SCRIPT_PROJECT, SCRIPT } = rtkQueryServiceTags;

export const PythonScripts = api.injectEndpoints({
  endpoints: (builder) => ({
    getScriptProjects: builder.query({
      query: () => "/script-projects/",
      providesTags: [SCRIPT_PROJECT, SCRIPT],
    }),
    createScriptProject: builder.mutation({
      query: (data) => ({
        url: "/script-projects/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [SCRIPT_PROJECT],
    }),
    createScript: builder.mutation({
      query: ({ id, data }) => ({
        url: `/script-projects/${id}/add-script/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [SCRIPT],
    }),
    editScript: builder.mutation({
      query: ({ id, data }) => ({
        url: `/script-case/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [SCRIPT],
    }),
    runScript: builder.mutation({
      query: (id) => ({ url: `/script-case/${id}/run/`, method: "POST" }),
      invalidatesTags: [SCRIPT],
    }),
  }),
});

export const {
  useGetScriptProjectsQuery,
  useCreateScriptProjectMutation,
  useCreateScriptMutation,
  useRunScriptMutation,
  useEditScriptMutation,
} = PythonScripts;
