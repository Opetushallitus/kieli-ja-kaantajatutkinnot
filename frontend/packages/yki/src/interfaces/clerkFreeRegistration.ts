import { Dayjs } from 'dayjs';

import { ExamLanguage, ExamLevel } from 'enums/app';

interface FreeRegistrationPerson {
  fullName: string;
  socialSecurityNumber: string;
  oid: string;
}

export type FreeRegistrationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'INFORMATION_REQUESTED'
  | 'INFORMATION_REQUEST_ANSWERED'
  | 'INFORMATION_REQUEST_EXPIRED';

type Registration =
  | {
      kind: 'ADMISSION';
    }
  | {
      kind: 'QUEUE';
      positionInQueue: number;
      queue: number;
    };

export type ClerkFreeRegistration = {
  id: number;
  person: FreeRegistrationPerson;
  status: FreeRegistrationStatus;
  supplementRequestDueDate?: Dayjs;
  assessmentDate?: Dayjs;
  examDate: Dayjs;
  registration: Registration;
};

export interface ClerkFreeRegistrationResponse
  extends Omit<
    ClerkFreeRegistration,
    'supplementRequestDueDate' | 'assessmentDate' | 'examDate'
  > {
  supplementRequestDueDate: string;
  assessmentDate: string;
  examDate: string;
}

type FreeRegistrationAttachment = {
  id: number;
  filename: string;
  url: string;
  submittedAt: Dayjs;
};

interface FreeRegistrationAttachmentResponse
  extends Omit<FreeRegistrationAttachment, 'submittedAt'> {
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

type FreeRegistrationBasis =
  | 'MATRICULATION_EXAMINATION'
  | 'HIGHER_EDUCATION_DEGREE'
  | 'HIGHER_EDUCATION_STUDIES'
  | 'COMPARABLE_MATRICULATION_EXAMINATION'
  | 'COMPARABLE_HIGHER_EDUCATION_DEGREE'
  | 'COMPARABLE_HIGHER_EDUCATION_STUDIES';

export type ClerkFreeRegistrationDetails = {
  id: number;
  person: FreeRegistrationPerson;
  status: FreeRegistrationStatus;
  freeRegistrationBasis: FreeRegistrationBasis;
  freeRegistrationsLeft: number;
  supplementRequestDueDate?: Dayjs;
  supplementRequest?: Comment;
  assessmentDate?: Dayjs;
  examSession: ExamSession;
  languageOfCommunication: 'fi' | 'sv' | 'en';
  registration: Registration;
  attachments: FreeRegistrationAttachment[];
  comments: Comment[];
};

export interface ClerkFreeRegistrationDetailsResponse
  extends Omit<
    ClerkFreeRegistrationDetails,
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
  attachments: FreeRegistrationAttachmentResponse[];
  comments: CommentResponse[];
}
