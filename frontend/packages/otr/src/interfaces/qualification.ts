import { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';
import { WithId, WithVersion } from 'shared/interfaces';

import { QualificationStatus } from 'enums/clerkInterpreter';
import { ExaminationType } from 'enums/interpreter';

export interface Qualification extends Partial<WithId>, Partial<WithVersion> {
  fromLang: string;
  toLang: string;
  beginDate: Dayjs;
  endDate: Dayjs;
  examinationType: ExaminationType;
  permissionToPublish: boolean;
  diaryNumber?: string;
  tempId?: string;
  interpreterId?: number;
}

export interface QualificationResponse
  extends Omit<Qualification, 'beginDate' | 'endDate'> {
  beginDate: string;
  endDate: string;
  deleted: boolean;
}

export type QualificationsGroupedByStatus = {
  [key in QualificationStatus]: Array<Qualification>;
};

export interface QualificationState {
  qualification: Qualification | Record<string, never>;
  status: APIResponseStatus;
}
