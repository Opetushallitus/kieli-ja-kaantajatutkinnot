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
import privacyEN from 'public/i18n/en-GB/privacy.json';
import transEN from 'public/i18n/en-GB/translation.json';
import accessibilityFI from 'public/i18n/fi-FI/accessibility.json';
import commonFI from 'public/i18n/fi-FI/common.json';
import privacyFI from 'public/i18n/fi-FI/privacy.json';
import transFI from 'public/i18n/fi-FI/translation.json';
import koodistoLangsEN from 'public/i18n/koodisto/langs/koodisto_langs_en-GB.json';
import koodistoLangsFI from 'public/i18n/koodisto/langs/koodisto_langs_fi-FI.json';
import koodistoLangsSV from 'public/i18n/koodisto/langs/koodisto_langs_sv-SE.json';
import koodistoRegionsEN from 'public/i18n/koodisto/regions/koodisto_regions_en-GB.json';
import koodistoRegionsFI from 'public/i18n/koodisto/regions/koodisto_regions_fi-FI.json';
import koodistoRegionsSV from 'public/i18n/koodisto/regions/koodisto_regions_sv-SE.json';
import accessibilitySV from 'public/i18n/sv-SE/accessibility.json';
import commonSV from 'public/i18n/sv-SE/common.json';
import privacySV from 'public/i18n/sv-SE/privacy.json';
import transSV from 'public/i18n/sv-SE/translation.json';

// Defaults and resources
const langFI = AppLanguage.Finnish;
const langSV = AppLanguage.Swedish;
const langEN = AppLanguage.English;

const supportedLangs = [langFI, langSV, langEN];

const resources = {
  [langFI]: {
    [I18nNamespace.Accessibility]: accessibilityFI,
    [I18nNamespace.Common]: commonFI,
    [I18nNamespace.KoodistoLanguages]: koodistoLangsFI,
    [I18nNamespace.KoodistoRegions]: koodistoRegionsFI,
    [I18nNamespace.Privacy]: privacyFI,
    [I18nNamespace.Translation]: transFI,
  },
  [langSV]: {
    [I18nNamespace.Accessibility]: accessibilitySV,
    [I18nNamespace.Common]: commonSV,
    [I18nNamespace.KoodistoLanguages]: koodistoLangsSV,
    [I18nNamespace.KoodistoRegions]: koodistoRegionsSV,
    [I18nNamespace.Privacy]: privacySV,
    [I18nNamespace.Translation]: transSV,
  },
  [langEN]: {
    [I18nNamespace.Accessibility]: accessibilityEN,
    [I18nNamespace.Common]: commonEN,
    [I18nNamespace.KoodistoLanguages]: koodistoLangsEN,
    [I18nNamespace.KoodistoRegions]: koodistoRegionsEN,
    [I18nNamespace.Privacy]: privacyEN,
    [I18nNamespace.Translation]: transEN,
  },
};

const detectionOptions = {
  order: ['localStorage', 'htmlTag'],
  caches: ['localStorage'],
  lookupLocalStorage: 'i18NextLng_otr',
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
  changeLang(currentLanguage);

  return i18n;
};

export const useAppTranslation = (
  options: UseTranslationOptions<string>,
  ns: I18nNamespace = I18nNamespace.Translation,
) => {
  return useTranslation(ns, options);
};

export const useAccessibilityTranslation = () => {
  const { t } = useAppTranslation(
    {
      keyPrefix: 'otr.accessibility',
    },
    I18nNamespace.Accessibility,
  );

  return t;
};

export const useCommonTranslation = () => {
  const { t } = useAppTranslation(
    {
      keyPrefix: 'otr.common',
    },
    I18nNamespace.Common,
  );

  return t;
};

export const useKoodistoLanguagesTranslation = () => {
  const { t } = useAppTranslation(
    {
      keyPrefix: 'otr.koodisto.languages',
    },
    I18nNamespace.KoodistoLanguages,
  );

  return t;
};

export const usePrivacyTranslation = () => {
  const { t } = useAppTranslation(
    {
      keyPrefix: 'otr.privacy',
    },
    I18nNamespace.Privacy,
  );

  return t;
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
