import { jest } from '@jest/globals';

jest.mock('configs/i18n', () => ({
  getCurrentLang: () => 'fi-FI',
  getSupportedLangs: () => ['fi-FI', 'sv-SE', 'en-GB'],
  changeLang: (language: string) => language,
  translateOutsideComponent: () => (str: string) => str,
  useAppTranslation: () => ({ t: (str: string) => str }),
  useCommonTranslation: () => (str: string) => str,
  useKoodistoLanguagesTranslation: () => (str: string) => str,
}));
