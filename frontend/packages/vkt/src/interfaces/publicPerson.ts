import { Dayjs } from 'dayjs';

export interface PublicPerson {
  id: number;
  identityNumber?: string;
  dateOfBirth?: Dayjs;
  lastName?: string;
  firstName: string;
}

export interface PublicPersonResponse
  extends Omit<PublicPerson, 'dateOfBirth'> {
  dateOfBirth?: string;
}
