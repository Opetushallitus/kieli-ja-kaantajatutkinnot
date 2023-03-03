import { Dayjs } from 'dayjs';

import { AuthorisationBasisEnum } from 'enums/clerkTranslator';
import { LanguagePair } from 'interfaces/languagePair';
import { WithId, WithTempId, WithVersion } from 'interfaces/with';

export type AuthorisationBasis = keyof typeof AuthorisationBasisEnum;

export interface Authorisation
  extends Partial<WithTempId>,
    Omit<
      AuthorisationResponse,
      'termBeginDate' | 'termEndDate' | 'examinationDate' | 'diaryNumber'
    > {
  termBeginDate?: Dayjs;
  termEndDate?: Dayjs;
  examinationDate?: Dayjs;
  diaryNumber: string;
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
