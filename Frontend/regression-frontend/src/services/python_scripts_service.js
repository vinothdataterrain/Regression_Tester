import { api } from "./api";

export const PythonScripts = api.injectEndpoints({
  endpoints: (builder) => ({
    getScriptProjects: builder.query({
      query: () => '/script-projects/'
    }),
    createScriptProject: builder.mutation({
        query: (data)=>({
            url: '/script-projects/',
            method: "POST",
            body:data
        })
    }),
    createScript: builder.mutation({
      query: ({id,data}) =>({
       url: `/script-projects/${id}/add-script/` ,
       method: "POST",
       body: data 
      })
    }) ,
    runScript: builder.mutation({
      query: (id) =>({ url: `/script-case/${id}/run/`, method:"POST"})

    }) 
  }),
});

export const { useGetScriptProjectsQuery,useCreateScriptProjectMutation, useCreateScriptMutation, useRunScriptMutation } = PythonScripts;