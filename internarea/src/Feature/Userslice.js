import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

export const userslice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userslice.actions;
export const selectuser = (state) => state.user.user;
export default userslice.reducer;
