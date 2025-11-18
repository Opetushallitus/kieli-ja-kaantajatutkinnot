import { Dayjs } from 'dayjs';
import { AppLanguage } from 'shared/enums';

import { ExamLanguage, ExamLevel, RegistrationStates } from 'enums/app';

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

type ExamLocationResponse = {
  name: string;
  municipality: string;
  lang: string;
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

type RegistrationStatusResponse = Omit<RegistrationStatus, 'paidAt'> & {
  paidAt?: string;
};

type ExamResponse = Omit<
  Exam,
  'registrationStatus' | 'registrationDate' | 'examinationDate' | 'examLocation'
> & {
  registrationStatus: RegistrationStatusResponse;

  examinationDate: string;
  registrationDate: string;
  examLocation: ExamLocationResponse[];
};

type QueueSpotOfferedResponse = Omit<QueueSpotOffered, 'dueDate'> & {
  dueDate?: string;
};

type QueuedExamResponse = Omit<
  QueuedRegistration,
  | 'registrationStatus'
  | 'queueSpotOffered'
  | 'registrationDate'
  | 'examinationDate'
  | 'examLocation'
> & {
  registrationStatus: RegistrationStatusResponse;
  queueSpotOffered: QueueSpotOfferedResponse;
  examinationDate: string;
  registrationDate: string;
  examLocation: ExamLocationResponse[];
};

export type PastExamResponse = Omit<
  PastExam,
  'examinationDate' | 'examLocation'
> & {
  examinationDate: string;
  examLocation: ExamLocationResponse[];
};

export interface ClerkCustomerDetailsResponse {
  person: CustomerPerson;
  registrations: ExamResponse[];
  queuedExams: QueuedExamResponse[];
  pastExams: PastExamResponse[];
}
