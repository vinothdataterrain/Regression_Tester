import { api } from "./api";

export const DashboardFeeds = api.injectEndpoints({
  endpoints: (builder) => ({
    getRecentActions: builder.query({
        query: ()=> '/recent-actions/'
    })
   }), });

export const { useGetRecentActionsQuery} = DashboardFeeds;

