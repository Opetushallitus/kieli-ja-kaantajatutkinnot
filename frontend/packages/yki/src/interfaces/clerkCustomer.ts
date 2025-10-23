import { Dayjs } from 'dayjs';

import {
  CertificateLanguage,
  ExamLanguage,
  ExamLevel,
  RegistrationStates,
  ServiceLanguage,
} from 'enums/app';

export interface CustomerPerson {
  firstName: string;
  lastName: string;
  ssn: string;
  oid: string;
  nationalityCode: string;
  languageOfService: ServiceLanguage;
  languageOfCertificate: CertificateLanguage;
  phoneNumber: string;
  streetAddress: string;
  email: string;
}

type Exam = {
  examinationDate: Dayjs;
  exam: {
    language: ExamLanguage;
    level: ExamLevel;
  };
  examLocation: {
    schoolName: string;
    municipality: string;
  };
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
  id: number;
  person: CustomerPerson;
  registrations: Exam[];
  queuedExams: QueuedRegistration[];
  pastExams: PastExam[];
}

// Response

interface RegistrationResponse {
  examinationDate: string;
  exam: {
    language: ExamLanguage;
    level: ExamLevel;
  };
  examLocation: {
    schoolName: string;
    municipality: string;
  };
  registrationStatus: {
    state: RegistrationStates;
    paidAt?: string;
  };
  registrationDate: string;
}
interface QueuedExamResponse {
  examinationDate: string;
  exam: {
    language: ExamLanguage;
    level: ExamLevel;
  };
  examLocation: {
    schoolName: string;
    municipality: string;
  };
  registrationStatus: {
    state: RegistrationStates;
    paidAt?: string;
  };
  registrationDate: string;
  queueSpotOffered: {
    offered: QueueOfferStatus;
    dueDate?: string;
  };
}

interface PastExamResponse {
  examinationDate: string;
  exam: {
    language: ExamLanguage;
    level: ExamLevel;
  };
  examLocation: {
    schoolName: string;
    municipality: string;
  };
  state: ExamState;
}

export interface ClerkCustomerDetailsResponse {
  id: number;
  person: CustomerPerson;
  registrations: RegistrationResponse[];
  queuedExams: QueuedExamResponse[];
  pastExams: PastExamResponse[];
}
