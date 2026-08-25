import enPublic from 'public/i18n/en-GB/public.json';
import fiPublic from 'public/i18n/fi-FI/public.json';
import svPublic from 'public/i18n/sv-SE/public.json';

const locales = {
  fi: fiPublic,
  sv: svPublic,
  en: enPublic,
};

// Keys resolved by ExamSessionUtils.getPartialExamTypeText. If any of these is
// missing or empty in a locale, the raw i18n key would leak to the user.
const examTypeKeys = [
  'full',
  'readSpeak',
  'read',
  'speak',
  'listenWrite',
  'listen',
  'write',
];

describe('examType i18n completeness', () => {
  Object.entries(locales).forEach(([lang, translations]) => {
    describe(`${lang} locale`, () => {
      const examType = translations.yki.component.registration.examSessionCard
        .examType as Record<string, string>;

      examTypeKeys.forEach((key) => {
        it(`has a non-empty translation for examType.${key}`, () => {
          expect(typeof examType[key]).toBe('string');
          expect(examType[key].trim().length).toBeGreaterThan(0);
        });
      });
    });
  });
});
