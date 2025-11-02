import { ExamLanguage } from 'enums/app';
import { FreeRegistrationBasis } from 'interfaces/freeRegistration';

interface KoskiEducation {
  educationType: FreeRegistrationBasis;
  source: 'KOSKI';
}

interface UserDeclaredEducation {
  educationType: FreeRegistrationBasis;
  countryOfStudies: 'finland' | 'abroad';
  source: 'USER';
}

export interface PublicFreeRegistrationDetails {
  basis?: KoskiEducation | UserDeclaredEducation;
  attemptsUsed?: {
    [ExamLanguage.FIN]: number;
    [ExamLanguage.SWE]: number;
  };
  isFree: IsFreeRegistration;
}

export type IsFreeRegistration = 'YES' | 'NO' | 'UNDECIDED';
