import i18n, { changeLanguage, t, use } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  initReactI18next,
  useTranslation,
  UseTranslationOptions,
} from 'react-i18next';
import { AppLanguage, I18nNamespace } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import accessibilityFI from 'public/i18n/fi-FI/accessibility.json';
import clerkFI from 'public/i18n/fi-FI/clerk.json';
import commonFI from 'public/i18n/fi-FI/common.json';
import privacyFI from 'public/i18n/fi-FI/privacy.json';
import publicFI from 'public/i18n/fi-FI/public.json';
import accessibilitySV from 'public/i18n/sv-SE/accessibility.json';
import clerkSV from 'public/i18n/sv-SE/clerk.json';
import commonSV from 'public/i18n/sv-SE/common.json';
import privacySV from 'public/i18n/sv-SE/privacy.json';
import publicSV from 'public/i18n/sv-SE/public.json';

// Defaults and resources
const langFI = AppLanguage.Finnish;
const langSV = AppLanguage.Swedish;

const supportedLangs = [langFI, langSV];

const resources = {
  [langFI]: {
    [I18nNamespace.Accessibility]: accessibilityFI,
    [I18nNamespace.Clerk]: clerkFI,
    [I18nNamespace.Common]: commonFI,
    [I18nNamespace.Privacy]: privacyFI,
    [I18nNamespace.Public]: publicFI,
  },
  [langSV]: {
    [I18nNamespace.Accessibility]: accessibilitySV,
    [I18nNamespace.Clerk]: clerkSV,
    [I18nNamespace.Common]: commonSV,
    [I18nNamespace.Privacy]: privacySV,
    [I18nNamespace.Public]: publicSV,
  },
};

const detectionOptions = {
  order: ['localStorage', 'htmlTag'],
  caches: ['localStorage'],
  lookupLocalStorage: 'i18NextLng_vkt',
};

// TypeScript definitions for react-i18next. IDE might show this to be unused, but ts does some type checking with it.
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof langFI;
    resources: {
      [langFI]: typeof commonFI;
      [langSV]: typeof commonSV;
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
  changeLang(currentLanguage);

  return i18n;
};

const useAppTranslation = (
  options: UseTranslationOptions<string>,
  ns: I18nNamespace
) => {
  // @ts-expect-error ts import fail
  return useTranslation(ns, options);
};

export const useAccessibilityTranslation = () => {
  const { t } = useAppTranslation(
    {
      keyPrefix: 'vkt.accessibility',
    },
    I18nNamespace.Accessibility
  );

  return t;
};

export const useClerkTranslation = (options: UseTranslationOptions<string>) => {
  return useAppTranslation(options, I18nNamespace.Clerk);
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

export const usePrivacyTranslation = () => {
  const { t } = useAppTranslation(
    {
      keyPrefix: 'vkt.privacy',
    },
    I18nNamespace.Privacy
  );

  return t;
};

export const usePublicTranslation = (
  options: UseTranslationOptions<string>
) => {
  return useAppTranslation(options, I18nNamespace.Public);
};

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
  document.documentElement.setAttribute('lang', language);

  return changeLanguage(language);
};
