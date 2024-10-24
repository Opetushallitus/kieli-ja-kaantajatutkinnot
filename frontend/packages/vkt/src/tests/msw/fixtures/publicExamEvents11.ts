import { ExamLanguage } from 'enums/app';

export const publicExamEvents11 = [
  {
    id: 1,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2022-10-01',
    registrationCloses: '2022-09-27',
    registrationOpens: '2022-09-23',
    isOpen: true,
    openings: 1,
    hasCongestion: true,
  },
  {
    id: 2,
    language: ExamLanguage.SV as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2022-10-01',
    registrationCloses: '2022-09-27',
    registrationOpens: '2022-09-23',
    isOpen: true,
    openings: 2,
    hasCongestion: false,
  },
  {
    id: 3,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2022-11-18',
    registrationCloses: '2022-11-06',
    registrationOpens: '2022-11-03',
    isOpen: true,
    openings: 5,
    hasCongestion: false,
  },
  {
    id: 4,
    language: ExamLanguage.SV as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2022-11-18',
    registrationCloses: '2022-11-06',
    registrationOpens: '2022-11-03',
    isOpen: true,
    openings: 7,
    hasCongestion: false,
  },
  {
    id: 5,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2022-12-24',
    registrationCloses: '2022-12-10',
    registrationOpens: '2022-12-03',
    isOpen: true,
    openings: 0,
    hasCongestion: false,
  },
  {
    id: 6,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-02-05',
    registrationCloses: '2023-01-22',
    registrationOpens: '2023-01-13',
    isOpen: true,
    openings: 7,
    hasCongestion: false,
  },
  {
    id: 7,
    language: ExamLanguage.SV as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-02-05',
    registrationCloses: '2023-01-22',
    registrationOpens: '2023-01-13',
    isOpen: true,
    openings: 8,
    hasCongestion: false,
  },
  {
    id: 8,
    language: ExamLanguage.SV as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-03-02',
    registrationCloses: '2023-03-01',
    registrationOpens: '2023-02-28',
    isOpen: true,
    openings: 9,
    hasCongestion: false,
  },
  {
    id: 9,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-03-30',
    registrationCloses: '2023-03-16',
    registrationOpens: '2023-03-16',
    isOpen: true,
    openings: 9,
    hasCongestion: false,
  },
  {
    id: 10,
    language: ExamLanguage.SV as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-03-30',
    registrationCloses: '2023-03-16',
    registrationOpens: '2023-03-12',
    isOpen: true,
    openings: 10,
    hasCongestion: false,
  },
  {
    id: 11,
    language: ExamLanguage.FI as Exclude<ExamLanguage, ExamLanguage.ALL>,
    date: '2023-06-15',
    registrationCloses: '2023-06-01',
    registrationOpens: '2023-05-22',
    isOpen: true,
    openings: 9,
    hasCongestion: false,
  },
];
