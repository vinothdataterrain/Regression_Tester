import { api } from "./api";
import { jwtDecode } from "jwt-decode";

export const LoginFeed = api.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (data) => ({
        url: "/auth/register/",
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => {
        if (response.status === 201) {
          localStorage.setItem("access_token", response.access);
          localStorage.setItem("refresh_token", response.refresh);
          const decoded = jwtDecode(response.access);
          return { status: response.status, UserResponse: decoded };
        }
        return response;
      },
    }),
    Login: builder.mutation({
      query: (data) => ({
        url: "/auth/login/",
        method: "POST",
        body: data,
      }),
       transformResponse: (response) => {
        if (response) {
          localStorage.setItem("access_token", response.access);
          localStorage.setItem("refresh_token", response.refresh);
          const decoded = jwtDecode(response.access);
          return { status: response.status, UserResponse: decoded };
        }
        return response;
      },
    }),
  }),
});

export const { useLoginMutation, useCreateUserMutation } = LoginFeed;
