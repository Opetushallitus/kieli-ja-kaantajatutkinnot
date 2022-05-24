import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Dialog, NotifierState, Toast } from 'interfaces/notifier';

const initialState: NotifierState = {
  dialogs: [],
  toasts: [],
};

const notifierSlice = createSlice({
  name: 'notifier',
  initialState,
  reducers: {
    removeNotifierDialog(state, action: PayloadAction<string>) {
      state.dialogs = state.dialogs.filter((d) => d.id != action.payload);
    },
    removeNotifierToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((d) => d.id != action.payload);
    },
    showNotifierDialog(state, action: PayloadAction<Dialog>) {
      state.dialogs = [...state.dialogs, action.payload];
    },
    showNotifierToast(state, action: PayloadAction<Toast>) {
      state.toasts = [...state.toasts, action.payload];
    },
  },
});

export const notifierReducer = notifierSlice.reducer;
export const {
  removeNotifierDialog,
  removeNotifierToast,
  showNotifierDialog,
  showNotifierToast,
} = notifierSlice.actions;
