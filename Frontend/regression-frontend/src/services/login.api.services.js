import { api } from "./api";

export const LoginFeed = api.injectEndpoints({
  endpoints: (builder) => ({
    Login: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["LOGIN", "USER"],
    }),

  }),
});

export const { useLoginMutation } = LoginFeed;
