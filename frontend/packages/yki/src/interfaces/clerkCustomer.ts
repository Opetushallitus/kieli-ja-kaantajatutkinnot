import { Dayjs } from 'dayjs';
import { AppLanguage } from 'shared/enums';

import {
  ExamLanguage,
  ExamLevel,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';

export interface CustomerPerson {
  firstName: string;
  lastName: string;
  ssn: string;
  oid: string;
  nationalityCode: string;
  phoneNumber?: string;
  streetAddress?: string;
  email?: string;
}

export type ExamLocation = {
  name: string;
  municipality: string;
  lang: AppLanguage;
};

export type Exam = {
  examDate: Dayjs;
  exam: {
    language: ExamLanguage;
    level: ExamLevel;
  };
  examLocation: ExamLocation[];
  registrationStatus: RegistrationStatus;
  registrationDate: Dayjs | undefined;
};

export type RegistrationStatus = {
  state: RegistrationStates;
  paidAt?: Dayjs;
};

export type QueueSpotOffered =
  | { offered: QueueOfferStatus.NotOffered }
  | {
      offered: QueueOfferStatus;
      expiresAt: Dayjs;
    };

export type QueuedRegistration = Exam & {
  queueSpotOffered: QueueSpotOffered;
};

export type ExamState = 'REVIEWED' | 'CANCELLED' | 'REGISTERED';

export type PastExam = Omit<Exam, 'registrationStatus' | 'registrationDate'> & {
  state: ExamState;
};

export enum QueueOfferStatus {
  Offered = 'OFFERED',
  NotOffered = 'NOT_OFFERED',
  NotAccepted = 'NOT_ACCEPTED',
}

export interface ClerkCustomerDetails {
  person: CustomerPerson;
  registrations: Exam[];
  queuedExams: QueuedRegistration[];
  pastExams: PastExam[];
}

export type RegistrationResponse = {
  examDate: string;
  exam: {
    language: ExamLanguage;
    level: ExamLevel;
  };
  examLocation: {
    name: string;
    municipality: string;
    lang: string;
  }[];
  registrationState: string;
  examPaymentPaidAt?: string;
  registrationDate?: string;
  kind: RegistrationKind; // ADMISSION
  liftedFromQueueAt?: string; // null
  expiresAt?: string; // null
};

export interface ClerkCustomerDetailsResponse {
  person: CustomerPerson;
  registrations: RegistrationResponse[];
}
