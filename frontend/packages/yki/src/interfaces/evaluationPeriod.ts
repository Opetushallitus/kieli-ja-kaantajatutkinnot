import { Dayjs } from 'dayjs';
import { WithId } from 'shared/src/interfaces/with';

import { ExamLanguage, ExamLevel } from 'enums/app';

interface EvaluationPeriodResponse
  extends Omit<
    EvaluationPeriod,
    'exam_date' | 'evaluation_start_date' | 'evaluation_end_date'
  > {
  exam_date: string;
  evaluation_start_date: string;
  evaluation_end_date: string;
}

export interface EvaluationPeriodsResponse {
  evaluation_periods: Array<EvaluationPeriodResponse>;
}

export interface EvaluationPeriod extends WithId {
  exam_date: Dayjs;
  language_code: ExamLanguage;
  level_code: ExamLevel;
  evaluation_start_date: Dayjs;
  evaluation_end_date: Dayjs;
  open: boolean;
}

export interface EvaluationPeriods {
  evaluation_periods: Array<EvaluationPeriod>;
}
