import { Dayjs } from 'dayjs';

import { ExamLanguage, ExamLevel } from 'enums/app';

interface FreeEnrollmentPerson {
  fullName: string;
  socialSecurityNumber: string;
  oid: string;
}

export type FreeEnrollmentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'INFORMATION_REQUESTED'
  | 'INFORMATION_REQUEST_ANSWERED';

type Registration =
  | {
      kind: 'ADMISSION';
    }
  | {
      kind: 'QUEUE';
      positionInQueue: number;
      queue: number;
    };

export type ClerkFreeEnrollment = {
  id: number;
  person: FreeEnrollmentPerson;
  status: FreeEnrollmentStatus;
  supplementRequestDueDate?: Dayjs;
  assessmentDate?: Dayjs;
  examDate: Dayjs;
  registration: Registration;
};

export interface ClerkFreeEnrollmentResponse
  extends Omit<
    ClerkFreeEnrollment,
    'supplementRequestDueDate' | 'assessmentDate' | 'examDate'
  > {
  supplementRequestDueDate: string;
  assessmentDate: string;
  examDate: string;
}

type FreeEnrollmentAttachment = {
  id: number;
  filename: string;
  url: string;
  submittedAt: Dayjs;
};

interface FreeEnrollmentAttachmentResponse
  extends Omit<FreeEnrollmentAttachment, 'submittedAt'> {
  submittedAt: string;
}

type Comment = {
  id: number;
  timestamp: Dayjs;
  commentor: string;
  comment: string;
};

interface CommentResponse extends Omit<Comment, 'timestamp'> {
  timestamp: string;
}

type ExamSession = {
  id: number;
  language: ExamLanguage;
  level: ExamLevel;
  examDate: Dayjs;
};

interface ExamSessionResponse extends Omit<ExamSession, 'examDate'> {
  examDate: string;
}

type FreeEnrollmentBasis =
  | 'MATRICULATION_EXAMINATION'
  | 'HIGHER_EDUCATION_DEGREE'
  | 'HIGHER_EDUCATION_STUDIES'
  | 'COMPARABLE_MATRICULATION_EXAMINATION'
  | 'COMPARABLE_HIGHER_EDUCATION_DEGREE'
  | 'COMPARABLE_HIGHER_EDUCATION_STUDIES';

export type ClerkFreeEnrollmentDetails = {
  id: number;
  person: FreeEnrollmentPerson;
  status: FreeEnrollmentStatus;
  freeEnrollmentBasis: FreeEnrollmentBasis;
  freeEnrollmentsLeft: number;
  supplementRequestDueDate?: Dayjs;
  supplementRequest?: Comment;
  assessmentDate?: Dayjs;
  examSession: ExamSession;
  languageOfCommunication: 'fi' | 'sv' | 'en';
  registration: Registration;
  attachments: FreeEnrollmentAttachment[];
  comments: Comment[];
};

export interface ClerkFreeEnrollmentDetailsResponse
  extends Omit<
    ClerkFreeEnrollmentDetails,
    | 'supplementRequestDueDate'
    | 'supplementRequest'
    | 'assessmentDate'
    | 'examSession'
    | 'attachments'
    | 'comments'
  > {
  supplementRequestDueDate?: string;
  supplementRequest?: CommentResponse;
  assessmentDate?: string;
  examSession: ExamSessionResponse;
  attachments: FreeEnrollmentAttachmentResponse[];
  comments: CommentResponse[];
}
