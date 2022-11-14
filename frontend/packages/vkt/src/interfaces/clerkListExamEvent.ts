import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

import { ExamLanguage, ExamLevel } from 'enums/app';

export interface ClerkListExamEvent extends WithId {
  language: Exclude<ExamLanguage, ExamLanguage.ALL>;
  level: ExamLevel;
  date: Dayjs;
  registrationCloses: Dayjs;
  participants: number;
  maxParticipants: number;
  isHidden: boolean;
}

export interface ClerkListExamEventResponse
  extends Omit<ClerkListExamEvent, 'date' | 'registrationCloses'> {
  date: string;
  registrationCloses: string;
}
