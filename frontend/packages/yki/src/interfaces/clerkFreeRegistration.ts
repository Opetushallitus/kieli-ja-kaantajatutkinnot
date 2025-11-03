import { Dayjs } from 'dayjs';

import { ExamLanguage, ExamLevel } from 'enums/app';
import { FreeRegistrationBasis } from 'interfaces/freeRegistration';

interface FreeRegistrationPerson {
  firstName: string;
  lastName: string;
  socialSecurityNumber: string;
  oid: string;
}

export type FreeRegistrationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUPPLEMENT_REQUESTED'
  | 'SUPPLEMENT_REQUEST_ANSWERED'
  | 'SUPPLEMENT_REQUEST_EXPIRED';

// exported in cypress which is excluded from root tsconfig.json
// so would give error otherwise
// ts-unused-exports:disable-next-line
export type Registration =
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

export type SortOrder = 'asc' | 'desc' | '';
type ClerkFreeRegistrationSortKeys = Omit<ClerkFreeRegistration, 'id'>;
export type ClerkFreeRegistrationSort =
  `${keyof ClerkFreeRegistrationSortKeys}:${SortOrder}`;

export interface ClerkFreeRegistrationResponse
  extends Omit<
    ClerkFreeRegistration,
    'supplementRequestDueDate' | 'assessmentDate' | 'examDate'
  > {
  supplementRequestDueDate?: string;
  assessmentDate?: string;
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

type Message = {
  id: number;
  createdAt: Dayjs;
  createdBy: string;
  text: string;
  type: 'COMMENT' | 'SUPPLEMENT_REQUEST';
};

type MessageResponse = Omit<Message, 'createdAt'> & {
  createdAt: string;
};

type ExamSession = {
  id: number;
  language: ExamLanguage;
  level: ExamLevel;
  examDate: Dayjs;
};

interface ExamSessionResponse extends Omit<ExamSession, 'examDate'> {
  examDate: string;
}

export type ClerkFreeRegistrationDetails = {
  id: number;
  person: FreeRegistrationPerson;
  status: FreeRegistrationStatus;
  freeRegistrationBasis: FreeRegistrationBasis;
  freeRegistrationsLeft: number;
  supplementRequestDueDate?: Dayjs;
  supplementRequest?: Message;
  assessmentDate?: Dayjs;
  examSession: ExamSession;
  languageOfService: 'fi' | 'sv' | 'en';
  registration: Registration;
  attachments: FreeRegistrationAttachment[];
  messages: Message[];
};

export interface ClerkFreeRegistrationDetailsResponse
  extends Omit<
    ClerkFreeRegistrationDetails,
    | 'supplementRequestDueDate'
    | 'supplementRequest'
    | 'assessmentDate'
    | 'examSession'
    | 'attachments'
    | 'messages'
  > {
  supplementRequestDueDate?: string;
  supplementRequest?: MessageResponse;
  assessmentDate?: string;
  examSession: ExamSessionResponse;
  attachments: FreeRegistrationAttachmentResponse[];
  messages: MessageResponse[];
}
