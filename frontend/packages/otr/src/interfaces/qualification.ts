import { Dayjs } from 'dayjs';
import { WithId, WithTempId, WithVersion } from 'shared/interfaces';

import { QualificationStatus } from 'enums/clerkInterpreter';
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
  diaryNumber?: string;
  interpreterId?: number;
}

export interface QualificationResponse
  extends Omit<Qualification, 'beginDate' | 'endDate'> {
  beginDate: string;
  endDate: string;
}

export type QualificationsGroupedByStatus = {
  [key in QualificationStatus]: Array<Qualification>;
};
