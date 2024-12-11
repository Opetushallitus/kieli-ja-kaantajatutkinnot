import { APIResponseStatus } from 'shared/enums';

import { MunicipalityCode } from 'interfaces/municipality';

export interface ExaminerDetailsUpsert {
  id?: number;
  oid: string;
  email: string;
  phoneNumber: string;
  examLanguageFinnish: boolean;
  examLanguageSwedish: boolean;
  isPublic: boolean;
  municipalities: Array<MunicipalityCode>;
}

export interface ExaminerDetailsUpsertState {
  status: APIResponseStatus;
  examinerDetails: Partial<ExaminerDetailsUpsert>;
}
