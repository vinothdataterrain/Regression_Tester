import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: "UserInfo",
  initialState,
  reducers: {
    setUserdata: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    resetUserdata: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setUserdata, resetUserdata, setLoading, setError } =
  userSlice.actions;

export default userSlice.reducer;
