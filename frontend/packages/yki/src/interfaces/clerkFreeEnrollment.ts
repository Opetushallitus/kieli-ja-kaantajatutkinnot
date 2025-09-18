import { Dayjs } from 'dayjs';

interface FreeEnrollmentPerson {
  fullName: string;
  socialSecurityNumber: string;
  oid: string;
}

type FreeEnrollmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'INFORMATION_REQUESTED';

type Registration =
  | {
      kind: 'ADMISSION';
    }
  | {
      kind: 'QUEUE';
      positionInQueue: number;
    };

export type ClerkFreeEnrollment = {
  id: number;
  person: FreeEnrollmentPerson;
  status: FreeEnrollmentStatus;
  dueDate?: Dayjs;
  assessmentDate?: Dayjs;
  examDate: Dayjs;
  registration: Registration;
};

export interface ClerkFreeEnrollmentResponse
  extends Omit<ClerkFreeEnrollment, 'dueDate' | 'assessmentDate' | 'examDate'> {
  dueDate: string;
  assessmentDate: string;
  examDate: string;
}

export interface ClerkFreeEnrollmentFilters {}
