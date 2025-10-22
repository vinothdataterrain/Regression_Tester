import { api } from "./api";

export const DashboardFeeds = api.injectEndpoints({
  endpoints: (builder) => ({
    getRecentActions: builder.query({
      query: (params) => ({
        url: "/recent-actions/",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetRecentActionsQuery } = DashboardFeeds;
