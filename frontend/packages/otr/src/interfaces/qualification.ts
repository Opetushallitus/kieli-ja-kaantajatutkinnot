import { Dayjs } from 'dayjs';
import { WithId, WithTempId, WithVersion } from 'shared/interfaces';

import { ExaminationType } from 'enums/interpreter';

export interface Qualification
  extends Partial<WithId>,
    Partial<WithVersion>,
    Partial<WithTempId> {
  fromLang: string;
  toLang: string;
  beginDate: Dayjs;
  endDate: Dayjs;
  examinationType: ExaminationType;
  permissionToPublish: boolean;
  diaryNumber: string;
}

export interface QualificationResponse
  extends Omit<Qualification, 'beginDate' | 'endDate' | 'diaryNumber'> {
  beginDate: string;
  endDate: string;
  diaryNumber?: string;
}

export interface NewQualification
  extends Omit<Qualification, 'beginDate' | 'endDate'> {
  beginDate?: Dayjs;
  endDate?: Dayjs;
}
