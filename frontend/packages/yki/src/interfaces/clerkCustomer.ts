import { ExamLanguage, ExamLevel } from 'enums/app';

interface CustomerPerson {
  name: string;
  oid: string;
  nationality: string;
  languageOfService: string;
  languageOfCertificate: string;
  phoneNumber: string;
  streetAddress: string;
  email: string;
}

export type RegistrationStatus =
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
  examLocation: string;
  registrationStatus: RegistrationStatus;
  registrationDate: string;
}

interface QueuedRegistration extends Exam {
  queueSpotOffered: {
    offered: boolean;
    dueDate: string;
  };
}

type ExamState = 'REVIEWED' | 'CANCELLED' | 'REGISTRADED';

interface PastExam
  extends Omit<Exam, 'registrationStatus' | 'registrationDate'> {
  state: ExamState;
}

export interface ClerkCustomerDetails {
  id: number;
  person: CustomerPerson;
  registrations: Exam[];
  queuedExams: QueuedRegistration[];
  pastExams: PastExam[];
}
