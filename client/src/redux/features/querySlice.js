import { createSlice } from "@reduxjs/toolkit";

export const querySlice = createSlice({
  name: "query",
  initialState: { query: true },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
  },
});

export const { setQuery } = querySlice.actions;
