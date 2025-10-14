import {
  CertificateLanguage,
  ExamLanguage,
  ExamLevel,
  ServiceLanguage,
} from 'enums/app';

interface CustomerPerson {
  name: string;
  oid: string;
  nationality: string;
  languageOfService: ServiceLanguage;
  languageOfCertificate: CertificateLanguage;
  phoneNumber: string;
  streetAddress: string;
  email: string;
}

type RegistrationStatus =
  | 'PAID'
  | 'PAID_CANCELLED'
  | 'CANCELLED'
  | 'CHECK_IN_PROGRESS'
  | 'NOT_PAID'
  | 'OVERDUE';

interface Exam {
  examinationDate: string;
  exam: {
    language: ExamLanguage;
    level: ExamLevel;
  };
  examLocation: {
    schoolName: string;
    municipality: string;
  };
  registrationStatus: RegistrationStatus;
  registrationDate: string;
}

type QueueSpotOffered =
  | { offered: QueueOfferStatus.NotOffered }
  | {
      offered: QueueOfferStatus.Offered | QueueOfferStatus.NotAccepted;
      dueDate: string;
    };

interface QueuedRegistration extends Exam {
  queueSpotOffered: QueueSpotOffered;
}

type ExamState = 'REVIEWED' | 'CANCELLED' | 'REGISTRADED';

interface PastExam
  extends Omit<Exam, 'registrationStatus' | 'registrationDate'> {
  state: ExamState;
}

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
