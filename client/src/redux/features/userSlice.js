import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: { user: null, banners: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setBanners: (state, action) => {
      state.banners = action.payload;
    },
  },
});

export const { setUser, setBanners } = userSlice.actions;
