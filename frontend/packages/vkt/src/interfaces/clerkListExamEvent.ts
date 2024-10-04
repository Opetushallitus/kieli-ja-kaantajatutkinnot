import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

import { ExamLanguage, ExamLevel } from 'enums/app';

export interface ClerkListExamEvent extends WithId {
  language: Exclude<ExamLanguage, ExamLanguage.ALL>;
  level: ExamLevel;
  date: Dayjs;
  registrationCloses: Dayjs;
  registrationOpens: Dayjs;
  participants: number;
  maxParticipants: number;
  isUnusedSeats: boolean;
  isHidden: boolean;
  unApprovedFreeEnrollments: number;
}

export interface ClerkListExamEventResponse
  extends Omit<
    ClerkListExamEvent,
    'date' | 'registrationCloses' | 'registrationOpens'
  > {
  date: string;
  registrationOpens: string;
  registrationCloses: string;
}
