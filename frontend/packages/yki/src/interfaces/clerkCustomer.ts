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
  ssn?: string;
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

export type AdmissionedRegistration = {
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

export type QueuedRegistration = AdmissionedRegistration & {
  queueSpotOffered: QueueSpotOffered;
};

export type ExamState = 'REVIEWED' | 'CANCELLED' | 'REGISTERED';

export type PastRegistration = Omit<
  AdmissionedRegistration,
  'registrationStatus' | 'registrationDate'
> & {
  state: ExamState;
};

export enum QueueOfferStatus {
  Offered = 'OFFERED',
  NotOffered = 'NOT_OFFERED',
  NotAccepted = 'NOT_ACCEPTED',
}

export interface ClerkCustomerDetails {
  person: CustomerPerson;
  admissionedRegistrations: AdmissionedRegistration[];
  queueRegistrations: QueuedRegistration[];
  pastRegistrations: PastRegistration[];
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
  kind: RegistrationKind;
  liftedFromQueueAt?: string;
  expiresAt?: string;
};

export interface ClerkCustomerSummary {
  person: CustomerPerson;
  registrationsCount: number;
}

export interface ClerkCustomerDetailsResponse {
  person: CustomerPerson;
  registrations: RegistrationResponse[];
}
