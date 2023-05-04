import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

export interface PublicPerson extends WithId {
  identityNumber?: string;
  dateOfBirth?: Dayjs;
  lastName?: string;
  firstName: string;
}

export interface PublicPersonResponse
  extends Omit<PublicPerson, 'dateOfBirth'> {
  dateOfBirth?: string;
}
