import { api } from "./api";

export const ProfileFeeds = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: (params) => ({
        url: "/auth/profile",
        method: "GET",
        params,
      }),
    }),
    editMyProfile: builder.mutation({
      query: (data) => ({
        url: "/auth/profile/",
        method: "PUT",
        body:data,
      }),
    }),
  }),
});

export const { useGetMyProfileQuery,useEditMyProfileMutation } = ProfileFeeds;
