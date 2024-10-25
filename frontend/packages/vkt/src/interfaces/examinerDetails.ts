import { APIResponseStatus } from 'shared/enums';
import { WithId } from 'shared/interfaces';
import { Municipality } from 'interfaces/municipality';

export interface ExaminerDetailsState {
  status: APIResponseStatus;
  examiner?: ExaminerDetails;
  oid?: string;
  initialized?: boolean;
}

export interface ExaminerDetails extends WithId {
  oid: string;
  lastName: string;
  firstName: string;
  email: string;
  phoneNumber: string;
  examLanguageFinnish: boolean;
  examLanguageSwedish: boolean;
  municipalities: Array<Municipality>;
  isPublic: boolean;
}

export type ExaminerDetailsInit = Pick<
  ExaminerDetails,
  'oid' | 'lastName' | 'firstName'
>;

export interface ExaminerDetailsInitState {
  status: APIResponseStatus;
  initData?: ExaminerDetailsInit;
}
