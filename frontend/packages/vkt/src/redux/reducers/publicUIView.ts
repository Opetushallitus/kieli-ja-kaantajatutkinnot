import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PublicUIViews } from 'enums/app';

const initialState = {
  currentView: PublicUIViews.ExamEventListing,
};

const publicUIViewSlice = createSlice({
  name: 'publicUIView',
  initialState,
  reducers: {
    setPublicUIView(state, action: PayloadAction<PublicUIViews>) {
      state.currentView = action.payload;
    },
  },
});

export const publicUIViewReducer = publicUIViewSlice.reducer;
export const { setPublicUIView } = publicUIViewSlice.actions;
