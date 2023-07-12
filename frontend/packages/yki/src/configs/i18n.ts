import i18n, { changeLanguage, t, use } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  initReactI18next,
  useTranslation,
  UseTranslationOptions,
} from 'react-i18next';
import { AppLanguage, I18nNamespace } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import commonEN from 'public/i18n/en-GB/common.json';
import publicEN from 'public/i18n/en-GB/public.json';
import commonFI from 'public/i18n/fi-FI/common.json';
import publicFI from 'public/i18n/fi-FI/public.json';
import commonSV from 'public/i18n/sv-SE/common.json';
import publicSV from 'public/i18n/sv-SE/public.json';

// Defaults and resources
const langFI = AppLanguage.Finnish;
const langSV = AppLanguage.Swedish;
const langEN = AppLanguage.English;

const supportedLangs = [langFI, langSV, langEN];

const resources = {
  [langFI]: {
    [I18nNamespace.Common]: commonFI,
    [I18nNamespace.Public]: publicFI,
  },
  [langSV]: {
    [I18nNamespace.Common]: commonSV,
    [I18nNamespace.Public]: publicSV,
  },
  [langEN]: {
    [I18nNamespace.Common]: commonEN,
    [I18nNamespace.Public]: publicEN,
  },
};

const detectionOptions = {
  order: ['localStorage', 'htmlTag'],
  caches: ['localStorage'],
  lookupLocalStorage: 'i18NextLng_yki',
};

// TypeScript definitions for react-i18next. IDE might show this to be unused, but ts does some type checking with it.
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof langFI;
    resources: {
      [langFI]: typeof commonFI;
      [langSV]: typeof commonSV;
      [langEN]: typeof commonEN;
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

const useAppTranslation = (
  options: UseTranslationOptions<string>,
  ns: I18nNamespace
) => {
  // @ts-expect-error ts import fail
  return useTranslation(ns, options);
};

export const usePublicTranslation = (
  options: UseTranslationOptions<string>
) => {
  return useAppTranslation(options, I18nNamespace.Public);
};

export const useCommonTranslation = () => {
  const { t } = useAppTranslation(
    {
      keyPrefix: 'yki.common',
    },
    I18nNamespace.Common
  );

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
