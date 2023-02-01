import i18n, { changeLanguage, t, use } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  initReactI18next,
  useTranslation,
  //UseTranslationOptions,
} from 'react-i18next';
import { AppLanguage, I18nNamespace } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import allEN from 'public/i18n/en-GB/all.json';
import allFI from 'public/i18n/fi-FI/all.json';
import allSV from 'public/i18n/sv-SE/all.json';

// Defaults and resources
const langFI = AppLanguage.Finnish;
const langSV = AppLanguage.Swedish;
const langEN = AppLanguage.English;

const supportedLangs = [langFI, langSV, langEN];

const resources = {
  [langFI]: {
    [I18nNamespace.Common]: allFI,
  },
  [langSV]: {
    [I18nNamespace.Common]: allSV,
  },
  [langEN]: {
    [I18nNamespace.Common]: allEN,
  },
};

const detectionOptions = {
  order: ['localStorage', 'htmlTag'],
  caches: ['localStorage'],
};

// TypeScript definitions for react-i18next. IDE might show this to be unused, but ts does some type checking with it.
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof langFI;
    resources: {
      [langFI]: typeof allFI;
      [langSV]: typeof allSV;
      [langEN]: typeof allEN;
    };
  }
}

export const initI18n = () => {
  const i18n = use(initReactI18next).use(LanguageDetector).init({
    defaultNS: 'common',
    resources,
    detection: detectionOptions,
    fallbackLng: langFI,
    load: 'currentOnly',
    debug: !REACT_ENV_PRODUCTION,
  });
  const currentLanguage = getCurrentLang() as AppLanguage;
  DateUtils.setDayjsLocale(currentLanguage);

  return i18n;
};

export const useCommonTranslation = () => {
  // @ts-expect-error ts import fail
  const { t } = useTranslation(I18nNamespace.Common, {});

  return t;
};

// ts-unused-exports:disable-next-line
export const translateOutsideComponent = () => {
  return t;
};

export const getCurrentLang = (): AppLanguage => {
  return i18n.language as AppLanguage;
};

export const getSupportedLangs = (): Array<AppLanguage> => {
  return supportedLangs;
};

export const changeLang = (language: AppLanguage) => {
  DateUtils.setDayjsLocale(language);

  return changeLanguage(language);
};
