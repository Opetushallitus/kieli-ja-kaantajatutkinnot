import { Dayjs } from 'dayjs';
import { WithId, WithVersion } from 'shared/interfaces';

import { QualificationStatus } from 'enums/clerkInterpreter';
import { ExaminationType } from 'enums/interpreter';

export interface Qualification extends WithId, WithVersion {
  deleted: boolean;
  fromLang: string;
  toLang: string;
  beginDate: Dayjs;
  endDate: Dayjs;
  examinationType: ExaminationType;
  permissionToPublish: boolean;
  diaryNumber?: string;
  tempId?: string;
}

export interface QualificationResponse
  extends Omit<Qualification, 'beginDate' | 'endDate'> {
  beginDate: string;
  endDate: string;
}

export type QualificationsGroupedByStatus = {
  [key in QualificationStatus]: Array<Qualification>;
};
