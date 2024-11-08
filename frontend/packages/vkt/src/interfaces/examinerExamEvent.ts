import { Dayjs } from "dayjs";
import { ExamLanguage } from "enums/app";
import { WithId, WithVersion } from "shared/interfaces";

export interface ExaminerExamEventResponse
  extends Omit<
    ExaminerExamEvent,
    'date' | 'registrationCloses'
  > {
  date: string;
  registrationCloses: string;
}

export interface ExaminerExamEvent
  extends WithId,
    WithVersion {
  date: Dayjs;
  language: Exclude<ExamLanguage, ExamLanguage.ALL>;
  isHidden: boolean;
  maxParticipants?: number;
  registrationCloses?: Dayjs;
}
