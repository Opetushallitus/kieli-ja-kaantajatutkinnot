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

type Exam = {
  examinationDate: Dayjs;
  exam: {
    language: ExamLanguage;
    level: ExamLevel;
  };
  examLocation: ExamLocation[];
  registrationStatus: RegistrationStatus;
  registrationDate: Dayjs;
};

export type RegistrationStatus =
  | {
      state: RegistrationStates.Completed;
      paidAt: Dayjs;
    }
  | { state: Exclude<RegistrationStates, RegistrationStates.Completed> };

export type QueueSpotOffered =
  | { offered: QueueOfferStatus.NotOffered }
  | {
      offered: QueueOfferStatus.Offered | QueueOfferStatus.NotAccepted;
      dueDate: Dayjs;
    };

type QueuedRegistration = Exam & {
  queueSpotOffered: QueueSpotOffered;
};

export type ExamState = 'REVIEWED' | 'CANCELLED' | 'REGISTERED';

type PastExam = Omit<Exam, 'registrationStatus' | 'registrationDate'> & {
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
  examinationDate: string;
  exam: {
    language: ExamLanguage;
    level: ExamLevel;
  };
  examLocation: {
    name: string;
    municipality: string;
    lang: string;
  }[];
  registrationStatus: {
    date: string;
    paidAt?: string;
  };
  registrationDate: string;
  kind: RegistrationKind;
};

export interface ClerkCustomerDetailsResponse {
  person: CustomerPerson;
  registrations: RegistrationResponse[];
}
