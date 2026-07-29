import { t } from 'i18next';

import { ExamLevel, ExamSessionType } from 'enums/app';
import { ClerkExamSession } from 'interfaces/clerkExamSession';
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
    name: 'suomi',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'swe',
    name: 'ruotsi',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'eng',
    name: 'englanti',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'deu',
    name: 'saksa',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'rus',
    name: 'venäjä',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'fra',
    name: 'ranska',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'sme',
    name: 'pohjoissaame',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'spa',
    name: 'espanja',
    levels: ['PERUS', 'KESKI', 'YLIN'],
  },
  {
    code: 'ita',
    name: 'italia',
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

  return found ? t('yki.common.languages.' + found.code) : '';
};

export const languagesToString = (array: OrganizerLanguage[]) => {
  return array
    .map((lang: OrganizerLanguage) => languageToString(lang.language_code))
    .reduce<Array<string>>((acc, l) => {
      if (acc.includes(l)) {
        return acc;
      }

      acc.push(l);

      return acc;
    }, [])
    .join(', ');
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
      list.push(
        `${languageToString(language.code)} - ${capitalize(description)}`,
      );
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
      ? (organization.postiosoite.postinumeroUri.split('_').pop() ?? '')
      : '',
    city: organization?.postiosoite?.postitoimipaikka ?? '',
  };
};

// Combinations are either:
// Tekstin ymmärtäminen + Puhuminen
// or
// Puheen ymmärtäminen + Kirjoittaminen
const getExamPartialType1 = (type: ExamSessionType) => {
  return type === ExamSessionType.READ_SPEAK
    ? t('yki.common.examParts.readingComprehension')
    : t('yki.common.examParts.speechComprehension');
};

const getExamPartialType2 = (type: ExamSessionType) => {
  return type === ExamSessionType.READ_SPEAK
    ? t('yki.common.examParts.speaking')
    : t('yki.common.examParts.writing');
};

export const getExamSessionStartTimesDescription = (
  examSession: ClerkExamSession,
) => {
  return examSession.type === ExamSessionType.FULL
    ? ''
    : t('yki.common.examSessionTimes.partialSessionTime', {
        partialExam1: getExamPartialType1(examSession.type),
        partialExam2: getExamPartialType2(examSession.type),
        time1: examSession.startTimeReadListen,
        time2: examSession.startTimeSpeakWrite,
      });
};
