import { APIResponseStatus } from 'shared/enums';

import { ExamLanguage } from 'enums/app';
import { FreeRegistrationBasis } from 'interfaces/freeRegistration';

export interface PublicEducationState {
  status: APIResponseStatus;
  koskiEducations: Array<FreeRegistrationBasis>;
}

// TODO Clarify naming! Now similar to KoskiEducation from within ./publicFreeRegistration.ts
export interface KoskiEducationDTO {
  educationType: 'ylioppilastutkinto' | 'korkeakoulutus' | 'dia' | 'eb';
  isActive: boolean;
}

export interface UsedFreeRegistrations {
  [ExamLanguage.FIN]: number;
  [ExamLanguage.SWE]: number;
}

export interface PublicEducationResponse {
  educations: Array<KoskiEducationDTO>;
  usedFreeRegistrations: UsedFreeRegistrations;
}
