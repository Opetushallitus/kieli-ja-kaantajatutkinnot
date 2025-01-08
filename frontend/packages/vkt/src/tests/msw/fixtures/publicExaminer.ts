import { ExamLanguage } from 'enums/app';
import { PublicExaminerResponse } from 'interfaces/publicExaminer';

export const publicExaminers: Array<PublicExaminerResponse> = [
  {
    id: 3,
    lastName: 'Aaltonen',
    firstName: 'Antti',
    languages: [ExamLanguage.SV],
    municipalities: [
      {
        fi: 'Enonkoski',
        sv: 'Enonkoski',
      },
    ],
    examDates: [],
  },
  {
    id: 2,
    lastName: 'Alanen',
    firstName: 'Anneli',
    languages: [ExamLanguage.FI, ExamLanguage.SV],
    municipalities: [
      {
        fi: 'Alavieska',
        sv: 'Alavieska',
      },
      {
        fi: 'Alavus',
        sv: 'Alavo',
      },
      {
        fi: 'Hyvinkää',
        sv: 'Hyvinge',
      },
      {
        fi: 'Ii',
        sv: 'Ii',
      },
      {
        fi: 'Kihniö',
        sv: 'Kihniö',
      },
    ],
    examDates: [
      {
        examDate: '2026-01-10',
        isFull: false,
      },
      {
        examDate: '2026-01-22',
        isFull: false,
      },
    ],
  },
  {
    id: 1,
    lastName: 'Eskola',
    firstName: 'Eero',
    languages: [ExamLanguage.FI],
    municipalities: [
      {
        fi: 'Oulu',
        sv: 'Uleåborg',
      },
    ],
    examDates: [],
  },
  {
    id: 4,
    lastName: 'Hakala',
    firstName: 'Ella',
    languages: [ExamLanguage.SV],
    municipalities: [
      {
        fi: 'Aura',
        sv: 'Aura',
      },
    ],
    examDates: [
      {
        examDate: '2025-06-15',
        isFull: false,
      },
    ],
  },
];
