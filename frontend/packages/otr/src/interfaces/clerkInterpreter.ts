import { APIResponseStatus } from 'shared/enums';
import { WithId, WithVersion } from 'shared/interfaces';

import { Qualification, QualificationResponse } from 'interfaces/qualification';

export interface ClerkInterpreter extends WithId, WithVersion {
  deleted: boolean;
  identityNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  permissionToPublishEmail: boolean;
  permissionToPublishPhone: boolean;
  permissionToPublishOtherContactInfo: boolean;
  qualifications: Array<Qualification>;
  regions: Array<string>;
  // Optional fields
  phoneNumber?: string;
  otherContactInfo?: string;
  street?: string;
  postalCode?: string;
  town?: string;
  country?: string;
  extraInformation?: string;
}

export interface ClerkInterpreterResponse
  extends Omit<ClerkInterpreter, 'qualifications'> {
  qualifications: Array<QualificationResponse>;
}

export interface ClerkInterpreterState {
  interpreters: Array<ClerkInterpreter>;
  status: APIResponseStatus;
}

export interface ClerkInterpreterOverviewState {
  interpreter?: ClerkInterpreter;
  overviewStatus: APIResponseStatus;
  interpreterDetailsUpdateStatus: APIResponseStatus;
  qualificationDetailsUpdateStatus: APIResponseStatus;
}
