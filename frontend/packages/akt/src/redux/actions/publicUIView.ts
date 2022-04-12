import { PublicUIViews } from 'enums/app';
import { DISPLAY_PUBLIC_VIEW } from 'redux/actionTypes/publicUIView';

export const setPublicUIView = (view: PublicUIViews) => ({
  type: DISPLAY_PUBLIC_VIEW,
  view,
});
