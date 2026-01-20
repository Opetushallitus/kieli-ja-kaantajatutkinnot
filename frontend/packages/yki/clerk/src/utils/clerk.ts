import { t } from 'i18next';

import { ExamLevel } from 'enums/app';
import { OrganizerLanguage } from 'interfaces/clerkOrganizer';
import { FindByOidsOrganization } from 'interfaces/clerkOrganizerRegistry';

const LEVEL_TRANSLATIONS = {
  PERUS: 'yki.common.languageLevel.PERUS',
  KESKI: 'yki.common.languageLevel.KESKI',
  YLIN: 'yki.common.languageLevel.YLIN',
  ALL: 'yki.common.languageLevel.ALL',
};

export const LANGUAGES = [
  {
    code: 'fin',
    name: 'Suomi',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'swe',
    name: 'Ruotsi',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'eng',
    name: 'Englanti',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'deu',
    name: 'Saksa',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'rus',
    name: 'Venäjä',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'fra',
    name: 'Ranska',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'sme',
    name: 'Pohjoissaame',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'spa',
    name: 'Espanja',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'ita',
    name: 'Italia',
    levels: ['PERUS', 'KESKI'],
  },
];

const capitalize = (s: string) => {
  if (typeof s !== 'string') return '';

  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const levelDescription = (level: keyof typeof ExamLevel) => {
  return t(LEVEL_TRANSLATIONS[level]);
};

export const languageToString = (lang: string) => {
  const found = LANGUAGES.find((l) => l.code === lang);

  return found ? found.name : '';
};

export const languagesToString = (array: OrganizerLanguage[]) => {
  const list = getLanguagesWithLevelDescriptions(array);

  return list.map((lang) => lang.split(' ')[0].toLowerCase()).join(', ');
};

export const getLanguagesWithLevelDescriptions = (
  array: OrganizerLanguage[],
) => {
  const list = [];
  for (const lang in LANGUAGES) {
    const language = LANGUAGES[lang];
    const levels = array
      .filter((lang) => lang !== null)
      .filter((l) => l.language_code === language.code)
      .map((l) => l.level_code)
      .reduce<Array<keyof typeof LEVEL_TRANSLATIONS>>(
        (acc, l) => acc.concat(l),
        [],
      );

    if (levels.length > 0) {
      const description =
        levels.length === language.levels.length
          ? t('yki.common.languageLevel.ALL')
          : levels
              .map((l) => levelDescription(l))
              .join(` ${t('yki.common.and')} `);
      list.push(`${language.name} - ${capitalize(description)}`);
    }
  }

  return list;
};

export const getOrganizerAddress = (
  organization: FindByOidsOrganization | undefined,
) => {
  return {
    street: organization?.postiosoite?.osoite ?? '',
    zipCode: organization?.postiosoite?.postinumeroUri
      ? organization.postiosoite.postinumeroUri.split('_').pop() ?? ''
      : '',
    city: organization?.postiosoite?.postitoimipaikka ?? '',
  };
};
