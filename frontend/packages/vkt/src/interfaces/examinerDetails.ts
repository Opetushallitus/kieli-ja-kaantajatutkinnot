import { Dayjs } from 'dayjs';
import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';

import { ExamEventToggleFilter, ExamLanguage } from 'enums/app';
import {
  ExaminerExamEvent,
  ExaminerExamEventResponse,
} from 'interfaces/examinerExamEvent';
import { MunicipalityCode } from 'interfaces/municipality';

export interface ExaminerDetailsState {
  status: APIResponseStatus;
  examiner?: ExaminerDetails;
  oid?: string;
  initialized?: boolean;
  examEventFilters: {
    languageFilter: ExamLanguage;
    toggleFilter: ExamEventToggleFilter;
  };
}

export interface ContactRequest extends WithId {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contactDate: Dayjs;
}

export interface ContactRequestResponse extends Omit<
  ContactRequest,
  'contactDate'
> {
  contactDate: string;
}

export interface ExaminerDetails extends WithId {
  oid: string;
  lastName: string;
  firstName: string;
  email: string;
  phoneNumber?: string;
  examLanguageFinnish: boolean;
  examLanguageSwedish: boolean;
  municipalities: Array<MunicipalityCode>;
  isPublic: boolean;
  examEvents: Array<ExaminerExamEvent>;
  contactRequests: Array<ContactRequest>;
}

export interface ExaminerDetailsResponse extends Omit<
  ExaminerDetails,
  'examEvents' | 'contactRequests'
> {
  examEvents: Array<ExaminerExamEventResponse>;
  contactRequests: Array<ContactRequestResponse>;
}

export type ExaminerDetailsInit = Pick<
  ExaminerDetails,
  'oid' | 'lastName' | 'firstName'
>;

export interface ExaminerDetailsInitState {
  status: APIResponseStatus;
  initData?: ExaminerDetailsInit;
}

export function isExaminerDetails(
  details: ExaminerDetailsInit,
): details is ExaminerDetails {
  return details.hasOwnProperty('id');
}
