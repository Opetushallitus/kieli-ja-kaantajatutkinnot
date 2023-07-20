import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

import { ExamLanguage, ExamLevel } from 'enums/app';

export interface ExaminationParts {
  readingComprehension: boolean;
  speechComprehension: boolean;
  speaking: boolean;
  writing: boolean;
}

export interface ParticipantDetails {
  firstNames?: string;
  lastName?: string;
  email?: string;
  birthdate?: string;
}

export type Subtest = 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING';

export interface EvaluationOrderRequest {
  first_names: string;
  last_name: string;
  email: string;
  birthdate: string;
  subtests: Array<Subtest>;
}

export interface EvaluationOrderResponse {
  redirect: string;
}

export interface EvaluationOrderDetails extends WithId {
  exam_date: Dayjs;
  language_code: ExamLanguage;
  level_code: ExamLevel;
  subtests: Array<Subtest>;
}

export interface EvaluationOrderDetailsResponse
  extends Omit<EvaluationOrderDetails, 'exam_date'> {
  exam_date: string;
}
