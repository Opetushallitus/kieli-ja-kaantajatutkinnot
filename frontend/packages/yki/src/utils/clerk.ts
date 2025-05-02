import { t } from 'i18next';

import { OrganizerLanguage } from 'interfaces/clerkOrganizer';

export const LEVEL_TRANSLATIONS = {
  PERUS: 'common.level.basic',
  KESKI: 'common.level.middle',
  YLIN: 'common.level.high',
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

export const capitalize = (s: string) => {
  if (typeof s !== 'string') return '';

  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const levelDescription = (level: keyof typeof LEVEL_TRANSLATIONS) => {
  return t(LEVEL_TRANSLATIONS[level]);
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
          ? t('common.level.all')
          : levels.map((l) => levelDescription(l)).join(` ${t('common.and')} `);
      list.push(`${language.name} - ${capitalize(description)}`);
    }
  }

  return list;
};
