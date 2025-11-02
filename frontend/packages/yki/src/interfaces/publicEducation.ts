import { APIResponseStatus } from "shared/enums";

import { FreeRegistrationBasis } from "interfaces/freeRegistration";

export interface PublicEducationState {
  status: APIResponseStatus;
  koskiEducations: Array<FreeRegistrationBasis>;
}
