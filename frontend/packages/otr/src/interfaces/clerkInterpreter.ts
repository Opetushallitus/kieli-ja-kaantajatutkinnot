import { WithId, WithVersion } from 'shared/interfaces';

import { QualificationStatus } from 'enums/clerkInterpreter';
import { ExaminationType, PermissionToPublish } from 'enums/interpreter';
import { Qualification, QualificationResponse } from 'interfaces/qualification';

export interface ClerkInterpreterTextFields {
  identityNumber: string;
  lastName: string;
  firstName: string;
  nickName: string;
  // Optional fields
  email?: string;
  phoneNumber?: string;
  otherContactInfo?: string;
  street?: string;
  postalCode?: string;
  town?: string;
  country?: string;
  extraInformation?: string;
}

export interface ClerkInterpreterBasicInformation
  extends ClerkInterpreterTextFields {
  permissionToPublishEmail: boolean;
  permissionToPublishPhone: boolean;
  permissionToPublishOtherContactInfo: boolean;
  regions: Array<string>;
}

export interface ClerkInterpreterQualifications {
  effective: Array<Qualification>;
  expiring: Array<Qualification>;
  expired: Array<Qualification>;
  expiredDeduplicated: Array<Qualification>;
}

export interface ClerkInterpreter
  extends WithId,
    WithVersion,
    ClerkInterpreterBasicInformation {
  deleted: boolean;
  isIndividualised: boolean;
  hasIndividualisedAddress: boolean;
  qualifications: ClerkInterpreterQualifications;
}

interface ClerkInterpreterQualificationsResponse {
  effective: Array<QualificationResponse>;
  expiring: Array<QualificationResponse>;
  expired: Array<QualificationResponse>;
  expiredDeduplicated: Array<QualificationResponse>;
}

export interface ClerkInterpreterResponse
  extends Omit<ClerkInterpreter, 'qualifications'> {
  qualifications: ClerkInterpreterQualificationsResponse;
}

export interface QualificationFilter {
  fromLang?: string;
  toLang?: string;
  examinationType?: ExaminationType;
  permissionToPublish?: PermissionToPublish;
}

export interface ClerkInterpreterFilters extends QualificationFilter {
  name?: string;
  qualificationStatus: QualificationStatus;
}
