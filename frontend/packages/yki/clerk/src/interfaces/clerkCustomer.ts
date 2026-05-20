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
  postOffice?: string;
  zip?: string;
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

export interface ClerkPersonContactUpdateRequest {
  oid: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  postOffice: string;
  zip: string;
}

export interface OrganizerPersonContactUpdateRequest
  extends ClerkPersonContactUpdateRequest {
  organizerOid: string;
}

export type OrganizerCustomerSearchParams = {
  request: {
    personQuery?: string;
    examDateId?: number;
    languageCode?: string;
    levelCode?: string;
  };
  page: number;
  size: number;
  oid: string;
};

export type ClerkCustomerSearchParams = {
  request: {
    personQuery?: string;
    organizerId?: number;
    examDateId?: number;
    languageCode?: string;
    levelCode?: string;
  };
  page: number;
  size: number;
};

export interface ClerkCustomerSummary {
  person: CustomerPerson;
  registrationsCount: number;
}

type PageSortResponse = {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
};

export type PageResponse<T> = {
  content: T[];
  pageable: {
    sort: PageSortResponse;
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  last: boolean;
  totalPages: number;
  size: number;
  number: number;
  sort: PageSortResponse;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
};

export interface ClerkCustomerSummaryResponse {
  person: {
    firstName: string;
    lastName: string;
    ssn: string | null;
    oid: string;
    nationalityCode: string;
    phoneNumber: string | null;
    streetAddress: string | null;
    postOffice: string | null;
    zip: string | null;
    email: string | null;
  };
  registrationsCount: number;
}

export interface ClerkCustomerDetailsResponse {
  person: CustomerPerson;
  registrations: RegistrationResponse[];
}
