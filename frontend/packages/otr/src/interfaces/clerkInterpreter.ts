import { WithId, WithVersion } from 'shared/interfaces';

import { QualificationStatus } from 'enums/clerkInterpreter';
import { ExaminationType, PermissionToPublish } from 'enums/interpreter';
import { Qualification, QualificationResponse } from 'interfaces/qualification';

// Backend does not store fields that are empty or have no value. Empty string
// defaults are used to init interpreterDetails in the modification view
export const INTERPRETER_DEFAULT_VALUES: ClerkInterpreterTextFields = {
  identityNumber: '',
  lastName: '',
  firstName: '',
  nickName: '',
  email: '',
  phoneNumber: '',
  otherContactInfo: '',
  street: '',
  postalCode: '',
  town: '',
  country: '',
  extraInformation: '',
};
export interface ClerkInterpreterTextFields {
  identityNumber: string;
  lastName: string;
  firstName: string;
  nickName: string;
  email: string;
  // Optional fields
  phoneNumber?: string;
  otherContactInfo?: string;
  street?: string;
  postalCode?: string;
  town?: string;
  country?: string;
  extraInformation?: string;
}
export interface ClerkInterpreter
  extends WithId,
    WithVersion,
    ClerkInterpreterTextFields {
  deleted: boolean;
  isIndividualised: boolean;
  permissionToPublishEmail: boolean;
  permissionToPublishPhone: boolean;
  permissionToPublishOtherContactInfo: boolean;
  regions: Array<string>;
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
