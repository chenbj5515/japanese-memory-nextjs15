import { createSlice } from "@reduxjs/toolkit";

export const cardIdSlice = createSlice({
  name: "localCards",
  initialState: {
    cardId: "",
  },
  reducers: {
    setCardId: (state, action) => {
      state.cardId = action.payload;
    },
  },
});

export const { setCardId } = cardIdSlice.actions;

export default cardIdSlice.reducer;
