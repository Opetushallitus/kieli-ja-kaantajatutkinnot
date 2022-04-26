import { Dayjs } from 'dayjs';

import { WithId, WithVersion } from 'interfaces/with';

export interface ExaminationDate extends Omit<ExaminationDateResponse, 'date'> {
  date: Dayjs;
}
export interface ExaminationDateResponse extends WithId, WithVersion {
  date: string;
}
