import { Dayjs } from 'dayjs';

export interface ExaminationParts {
  readingComprehension: boolean;
  speechComprehension: boolean;
  speaking: boolean;
  writing: boolean;
}

export interface PayerDetails {
  firstNames?: string;
  lastName?: string;
  email?: string;
  birthdate?: Dayjs;
}
