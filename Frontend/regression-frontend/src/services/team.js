import { api, rtkQueryServiceTags } from "./api";
const {ADD_MEMBER, TEAM_MEMBERS} = rtkQueryServiceTags;


export const TeamApis = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserTeams: builder.query({
      query: () => ({
        url: "/user/teams/",
        method: "GET",
      }),
      providesTags : [TEAM_MEMBERS]
    }),
    addTeamMember: builder.mutation({
      query: (data) => ({
        url: "/team/add-member/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TEAM_MEMBERS, ADD_MEMBER]
    }),
    getTeamMembers: builder.query({
      query: () => "/team/members/",
      providesTags : [TEAM_MEMBERS]
    }),
  }),
});

export const { useAddTeamMemberMutation, useGetUserTeamsQuery, useGetTeamMembersQuery } = TeamApis;
