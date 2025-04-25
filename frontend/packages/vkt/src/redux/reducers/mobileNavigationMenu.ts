import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MobileNavigationMenuState {
  open: boolean;
}

const initialState: MobileNavigationMenuState = {
  open: false,
};

const mobileNavigationMenuSlice = createSlice({
  name: 'mobileNavigationMenu',
  initialState,
  reducers: {
    setMobileNavigationMenuState(state, action: PayloadAction<boolean>) {
      state.open = action.payload;
    },
  },
});

export const mobileNavigationMenuReducer = mobileNavigationMenuSlice.reducer;
export const { setMobileNavigationMenuState } =
  mobileNavigationMenuSlice.actions;
