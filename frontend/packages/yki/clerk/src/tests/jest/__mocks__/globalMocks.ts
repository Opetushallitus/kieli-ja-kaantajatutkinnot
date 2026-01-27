import { jest } from '@jest/globals';

jest.mock('configs/i18n', () => ({
  getCurrentLang: () => 'fi-FI',
  getSupportedLangs: () => ['fi-FI', 'sv-SE', 'en-GB'],
  changeLang: (language: string) => language,
  usePublicTranslation: () => ({ t: (str: string) => str }),
  useCommonTranslation: () => (str: string) => str,
  translateOutsideComponent: () => (str: string) => {
    if (str === 'yki.common.dates.dateTimeFormat') {
      return 'l [klo] HH.mm';
    } else {
      return str;
    }
  },
}));
