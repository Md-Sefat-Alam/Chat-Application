import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ILogin,
  ILoginData,
  ILoginReturn,
  ILoginVerify,
  ISelectUserReturn,
  ISelectUserSend,
} from "../../pages/Login/loginTypes";
import { IRegister } from "../../pages/Register/registerTypes";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3009/api/" }),
  tagTypes: ["USERS"],
  endpoints: (builder) => ({
    getAllUsers: builder.query<IRegister, string>({
      query: (name) => `user`,
      providesTags: ["USERS"],
    }),
    postUser: builder.mutation<void, IRegister>({
      query: (body) => ({
        url: `user/add`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["USERS"],
    }),
    login: builder.query<ILoginReturn, ILogin>({
      query: (body) => ({
        url: `user/login`,
        method: "POST",
        body,
      }),
    }),
    loginData: builder.mutation<ILoginData, ILoginVerify>({
      query: (body) => ({
        url: `user/user-data`,
        method: "POST",
        body,
      }),
    }),
    selectLiveChatUser: builder.mutation<ISelectUserReturn, ISelectUserSend>({
      query: (body) => ({
        url: `chat/select-user`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  usePostUserMutation,
  useLazyLoginQuery,
  useLoginDataMutation,
  useSelectLiveChatUserMutation
} = userApi;
