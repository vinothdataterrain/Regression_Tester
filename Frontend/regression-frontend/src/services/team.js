import { api } from "./api";

export const TeamApis = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserTeams: builder.query({
      query: () => ({
        url: "/user/teams/",
        method: "GET",
      }),
    }),
    addTeamMember: builder.mutation({
      query: (username) => ({
        url: "/team/add-member/",
        method: "POST",
        body: { username },
      }),
    }),
    getTeamMembers: builder.query({
      query: () => "/team/members/",
    }),
  }),
});

export const { useAddTeamMemberMutation, useGetUserTeamsQuery, useGetTeamMembersQuery } = TeamApis;
