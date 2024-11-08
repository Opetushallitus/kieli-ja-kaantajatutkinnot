import { Dayjs } from "dayjs";
import { ExamLanguage } from "enums/app";
import { WithId, WithVersion } from "shared/interfaces";
import { MunicipalityCode } from "./municipality";

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
  municipality: MunicipalityCode;
  location: string;
  isHidden: boolean;
  maxParticipants?: number;
  registrationCloses?: Dayjs;
}
