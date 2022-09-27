import i18n, { changeLanguage, t, use } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  initReactI18next,
  useTranslation,
  UseTranslationOptions,
} from 'react-i18next';
import { AppLanguage, I18nNamespace } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import accessibilityEN from 'public/i18n/en-GB/accessibility.json';
import commonEN from 'public/i18n/en-GB/common.json';
import transEN from 'public/i18n/en-GB/translation.json';
import accessibilityFI from 'public/i18n/fi-FI/accessibility.json';
import commonFI from 'public/i18n/fi-FI/common.json';
import transFI from 'public/i18n/fi-FI/translation.json';
import accessibilitySV from 'public/i18n/sv-SE/accessibility.json';
import commonSV from 'public/i18n/sv-SE/common.json';
import transSV from 'public/i18n/sv-SE/translation.json';

// Defaults and resources
const langFI = AppLanguage.Finnish;
const langSV = AppLanguage.Swedish;
const langEN = AppLanguage.English;

const supportedLangs = [langFI, langSV, langEN];

const resources = {
  [langFI]: {
    [I18nNamespace.Common]: commonFI,
    [I18nNamespace.Translation]: transFI,
    [I18nNamespace.Accessibility]: accessibilityFI,
  },
  [langSV]: {
    [I18nNamespace.Common]: commonSV,
    [I18nNamespace.Translation]: transSV,
    [I18nNamespace.Accessibility]: accessibilitySV,
  },
  [langEN]: {
    [I18nNamespace.Common]: commonEN,
    [I18nNamespace.Translation]: transEN,
    [I18nNamespace.Accessibility]: accessibilityEN,
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
      [langFI]: typeof transFI;
      [langSV]: typeof transSV;
      [langEN]: typeof transEN;
    };
  }
}

export const initI18n = () => {
  const i18n = use(initReactI18next).use(LanguageDetector).init({
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

export const useAppTranslation = (
  options: UseTranslationOptions<string>,
  ns: I18nNamespace = I18nNamespace.Translation
) => {
  // @ts-expect-error ts import fail
  return useTranslation(ns, options);
};

export const useCommonTranslation = () => {
  const { t } = useAppTranslation(
    {
      keyPrefix: 'vkt.common',
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
