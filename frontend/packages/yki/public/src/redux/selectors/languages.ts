import { RootState } from 'configs/redux';
import { LanguageCodesState } from 'redux/reducers/languages';

export const languagesSelector = (state: RootState): LanguageCodesState =>
  state.languages;
