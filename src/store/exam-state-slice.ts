import { createSlice } from "@reduxjs/toolkit";

export const examStateSlice = createSlice({
  name: "localCards",
  initialState: {
    status: "initial",
  },
  reducers: {
    startExam: (state) => {
        state.status = "ongoing"
    },
  },
});

export const { startExam } = examStateSlice.actions;

export default examStateSlice.reducer;
