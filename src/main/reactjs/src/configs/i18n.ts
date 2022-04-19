import i18n, { changeLanguage, use, t } from 'i18next';
import {
  initReactI18next,
  useTranslation,
  UseTranslationOptions,
} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import transFI from 'public/i18n/fi-FI.json';
import transSV from 'public/i18n/sv-SE.json';
import transEN from 'public/i18n/en-GB.json';
import koodistoLangsFI from 'public/i18n/koodisto/langs/koodisto_langs_fi-FI.json';
import koodistoLangsSV from 'public/i18n/koodisto/langs/koodisto_langs_sv-SE.json';
import koodistoLangsEN from 'public/i18n/koodisto/langs/koodisto_langs_en-GB.json';
import { I18nNamespace } from 'enums/app';

// Defaults and resources
const langFI = 'fi-FI';
const langSV = 'sv-SE';
const langEN = 'en-GB';

const detectionOptions = {
  order: ['localStorage', 'htmlTag'],
  caches: ['localStorage'],
};

const supportedLangs = [langFI, langSV, langEN];

const resources = {
  [langFI]: {
    [I18nNamespace.Translation]: transFI,
    [I18nNamespace.KoodistoLanguages]: koodistoLangsFI,
  },
  [langSV]: {
    [I18nNamespace.Translation]: transSV,
    [I18nNamespace.KoodistoLanguages]: koodistoLangsSV,
  },
  [langEN]: {
    [I18nNamespace.Translation]: transEN,
    [I18nNamespace.KoodistoLanguages]: koodistoLangsEN,
  },
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
  return use(initReactI18next)
    .use(LanguageDetector)
    .init({
      resources,
      detection: detectionOptions,
      fallbackLng: langFI,
      load: 'currentOnly',
      debug: process.env.NODE_ENV === 'development',
    });
};

export const useAppTranslation = (
  options: UseTranslationOptions<string>,
  ns: I18nNamespace = I18nNamespace.Translation
) => {
  // @ts-expect-error ts import fail
  return useTranslation(ns, options);
};

export const useKoodistoLanguagesTranslation = () => {
  const { t } = useAppTranslation(
    {
      keyPrefix: 'akt.koodisto.languages',
    },
    I18nNamespace.KoodistoLanguages
  );

  return t;
};

export const translateOutsideComponent = () => {
  return t;
};

export const getCurrentLang = (): string => {
  return i18n.language;
};

export const getSupportedLangs = (): string[] => {
  return supportedLangs;
};

export const changeLang = (language: string) => {
  return changeLanguage(language);
};

export const onLangChanged = (callback: (language: string) => void) => {
  return i18n.on('languageChanged', callback);
};
