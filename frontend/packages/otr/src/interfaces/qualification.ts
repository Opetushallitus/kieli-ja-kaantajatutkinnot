import { Dayjs } from 'dayjs';
import { WithId, WithVersion } from 'shared/interfaces';

import { ExaminationType } from 'enums/examinationType';

export interface Qualification extends WithId, WithVersion {
  deleted: boolean;
  fromLang: string;
  toLang: string;
  beginDate: Dayjs;
  endDate: Dayjs;
  examinationType: ExaminationType;
  permissionToPublish: boolean;
  diaryNumber?: string;
}

export interface QualificationResponse
  extends Omit<Qualification, 'beginDate' | 'endDate'> {
  beginDate: string;
  endDate: string;
}
