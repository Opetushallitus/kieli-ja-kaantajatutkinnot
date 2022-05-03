import { jest } from '@jest/globals';

jest.mock('configs/i18n', () => ({
  getCurrentLang: () => 'fi-FI',
  getSupportedLangs: () => ['fi-FI', 'sv-SE', 'en-GB'],
  changeLang: (language: string) => language,
  useAppTranslation: () => ({ t: (str: string) => str }),
  useCommonTranslation: () => (str: string) => str,
  useKoodistoLanguagesTranslation: () => (str: string) => str,
}));

const mockAppSelector = jest.fn(() => ({}));
const mockDispatch = jest.fn();
jest.mock('configs/redux', () => ({
  useAppDispatch: mockDispatch,
  useAppSelector: mockAppSelector,
}));
