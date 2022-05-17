import { Dayjs } from 'dayjs';
import { Action } from 'redux';
import { APIResponseStatus } from 'shared/enums';

import {
  AuthorisationBasisEnum,
  AuthorisationStatus,
} from 'enums/clerkTranslator';
import { LanguagePair } from 'interfaces/languagePair';
import { WithId, WithTempId, WithVersion } from 'interfaces/with';

export type AuthorisationBasis = keyof typeof AuthorisationBasisEnum;

export interface Authorisation
  extends Partial<WithTempId>,
    Omit<
      AuthorisationResponse,
      'termBeginDate' | 'termEndDate' | 'examinationDate'
    > {
  termBeginDate?: Dayjs;
  termEndDate?: Dayjs;
  examinationDate?: Dayjs;
  translatorId?: number;
}

export interface AuthorisationResponse
  extends Partial<WithId>,
    Partial<WithVersion> {
  languagePair: LanguagePair;
  basis: AuthorisationBasis;
  termBeginDate?: string;
  termEndDate?: string;
  permissionToPublish: boolean;
  diaryNumber?: string;
  examinationDate?: string;
}

export type AuthorisationsGroupedByStatus = {
  [key in AuthorisationStatus]: Array<Authorisation>;
};
export interface AddAuthorisationState {
  status: APIResponseStatus;
  authorisation: Authorisation | Record<string, never>;
}

export interface AddAuthorisationAction extends Action {
  authorisation: Authorisation;
}
