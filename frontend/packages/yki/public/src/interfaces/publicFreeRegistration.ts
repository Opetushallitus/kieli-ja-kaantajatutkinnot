import { FreeRegistrationBasis } from 'interfaces/freeRegistration';

interface KoskiEducation {
  educationType: FreeRegistrationBasis;
  source: 'KOSKI';
}

export type CountryOfEducation = 'finland' | 'abroad';

export interface UserDeclaredEducation {
  educationType: FreeRegistrationBasis;
  countryOfEducation: CountryOfEducation;
  source: 'USER';
}

export interface UserDeclaredEducationDetails {
  countryOfEducation?: 'finland' | 'abroad' | 'uneligible';
  educationDetails?:
    | 'matriculationExam'
    | 'higherEducationConcluded'
    | 'higherEducationEnrolled'
    | 'uneligible';
}

export interface PublicFreeRegistrationDetails {
  basis?: KoskiEducation | UserDeclaredEducation;
  attemptsUsed?: number;
  isFree: IsFreeRegistration;
}

type IsFreeRegistration = 'YES' | 'NO' | 'UNDECIDED';
