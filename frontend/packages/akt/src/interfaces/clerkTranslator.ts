import { PermissionToPublish } from 'enums/app';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import {
  Authorisation,
  AuthorisationBasis,
  AuthorisationResponse,
} from 'interfaces/authorisation';
import { WithId, WithVersion } from 'interfaces/with';

export interface ClerkTranslatorTextFields {
  firstName: string;
  lastName: string;
  identityNumber?: string;
  email?: string;
  phoneNumber?: string;
  street?: string;
  postalCode?: string;
  town?: string;
  country?: string;
  extraInformation?: string;
}

export interface ClerkTranslatorBasicInformation
  extends ClerkTranslatorTextFields {
  isAssuranceGiven: boolean;
}

export interface ClerkTranslatorResponse
  extends ClerkTranslatorBasicInformation,
    WithId,
    WithVersion {
  authorisations: Array<AuthorisationResponse>;
}

export interface ClerkTranslator
  extends Omit<ClerkTranslatorResponse, 'authorisations'> {
  authorisations: Array<Authorisation>;
}

export interface ClerkTranslatorFilter {
  fromLang?: string;
  toLang?: string;
  name?: string;
  authorisationStatus: AuthorisationStatus;
  authorisationBasis?: AuthorisationBasis;
  permissionToPublish?: keyof typeof PermissionToPublish;
}
