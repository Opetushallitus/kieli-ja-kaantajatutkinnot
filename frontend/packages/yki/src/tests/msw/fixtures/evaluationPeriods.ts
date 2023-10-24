import { ExamLanguage, ExamLevel } from 'enums/app';
import { EvaluationPeriodsResponse } from 'interfaces/evaluationPeriod';

export const evaluationPeriods: EvaluationPeriodsResponse = {
  evaluation_periods: [
    {
      id: 1,
      exam_date: '2023-05-10',
      language_code: 'fin' as ExamLanguage,
      level_code: 'KESKI' as ExamLevel,
      evaluation_start_date: '2023-04-01',
      evaluation_end_date: '2024-12-30',
      open: true,
    },
    {
      id: 2,
      exam_date: '2025-12-24',
      language_code: 'fin' as ExamLanguage,
      level_code: 'PERUS' as ExamLevel,
      evaluation_start_date: '2060-04-21',
      evaluation_end_date: '2060-05-30',
      open: false,
    },
  ],
};
