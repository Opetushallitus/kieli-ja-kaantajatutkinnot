import { ExamLanguage } from 'enums/app';

export const publicExamEvents11 = [
  {
    id: 1,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2022-10-01',
    registrationCloses: '2022-09-27',
    openings: 1,
    hasCongestion: true,
  },
  {
    id: 2,
    language: ExamLanguage.SV as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2022-10-01',
    registrationCloses: '2022-09-27',
    openings: 2,
    hasCongestion: false,
  },
  {
    id: 3,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2022-11-18',
    registrationCloses: '2022-11-06',
    openings: 5,
    hasCongestion: false,
  },
  {
    id: 4,
    language: ExamLanguage.SV as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2022-11-18',
    registrationCloses: '2022-11-06',
    openings: 7,
    hasCongestion: false,
  },
  {
    id: 5,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2022-12-24',
    registrationCloses: '2022-12-10',
    openings: 0,
    hasCongestion: false,
  },
  {
    id: 6,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-02-05',
    registrationCloses: '2023-01-22',
    openings: 7,
    hasCongestion: false,
  },
  {
    id: 7,
    language: ExamLanguage.SV as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-02-05',
    registrationCloses: '2023-01-22',
    openings: 8,
    hasCongestion: false,
  },
  {
    id: 8,
    language: ExamLanguage.SV as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-03-02',
    registrationCloses: '2023-03-01',
    openings: 9,
    hasCongestion: false,
  },
  {
    id: 9,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-03-30',
    registrationCloses: '2023-03-16',
    openings: 9,
    hasCongestion: false,
  },
  {
    id: 10,
    language: ExamLanguage.SV as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-03-30',
    registrationCloses: '2023-03-16',
    openings: 10,
    hasCongestion: false,
  },
  {
    id: 11,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-06-15',
    registrationCloses: '2023-06-01',
    openings: 9,
    hasCongestion: false,
  },
];
