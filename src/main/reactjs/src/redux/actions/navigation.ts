import { UIStates } from 'enums/app';
import { DISPLAY_UI_STATE } from 'redux/actionTypes/navigation';

export const displayUIState = (state: UIStates) => ({
  type: DISPLAY_UI_STATE,
  state,
});
