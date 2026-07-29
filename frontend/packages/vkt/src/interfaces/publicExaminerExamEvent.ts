import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

import { ExamLanguage } from 'enums/app';
import { MunicipalityCode } from 'interfaces/municipality';
import { PublicExaminer } from 'interfaces/publicExaminer';

export interface PublicExaminerExamEvent extends WithId {
  examiner: Pick<PublicExaminer, 'name'>;
  language: Exclude<ExamLanguage, ExamLanguage.ALL>;
  date: Dayjs;
  examTime: string;
  municipality: MunicipalityCode;
  location: string;
  registrationCloses: Dayjs;
  openings: number;
}

export interface PublicExaminerExamEventResponse extends Omit<
  PublicExaminerExamEvent,
  'date' | 'registrationCloses'
> {
  date: string;
  registrationCloses: string;
}
