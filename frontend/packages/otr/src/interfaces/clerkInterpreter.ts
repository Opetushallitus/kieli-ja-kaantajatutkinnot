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

export interface ClerkInterpreter
  extends WithId,
    WithVersion,
    ClerkInterpreterBasicInformation {
  deleted: boolean;
  isIndividualised: boolean;
  qualifications: Array<Qualification>;
}

export interface ClerkInterpreterResponse
  extends Omit<ClerkInterpreter, 'qualifications'> {
  qualifications: Array<QualificationResponse>;
}

export interface ClerkInterpreterFilters {
  qualificationStatus: QualificationStatus;
  fromLang?: string;
  toLang?: string;
  name?: string;
  examinationType?: ExaminationType;
  permissionToPublish?: PermissionToPublish;
}
