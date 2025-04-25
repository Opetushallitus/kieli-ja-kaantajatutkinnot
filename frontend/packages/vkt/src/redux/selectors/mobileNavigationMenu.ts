import { RootState } from 'configs/redux';
import { MobileNavigationMenuState } from 'redux/reducers/mobileNavigationMenu';

export const mobileNavigationMenuSelector: (
  state: RootState,
) => MobileNavigationMenuState = (state: RootState) =>
  state.mobileNavigationMenu;
