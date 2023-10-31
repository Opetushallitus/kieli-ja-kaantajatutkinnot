import { PermissionToPublish } from 'enums/app';
import {
  AuthorisationStatus,
  TranslatorEmailStatus,
} from 'enums/clerkTranslator';
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
  extraInformation?: string;
}

export interface ClerkTranslatorBasicInformation
  extends ClerkTranslatorTextFields {
  country?: string;
  isAssuranceGiven: boolean;
}

interface ClerkTranslatorAuthorisationsResponse {
  effective: Array<AuthorisationResponse>;
  expiring: Array<AuthorisationResponse>;
  expired: Array<AuthorisationResponse>;
  expiredDeduplicated: Array<AuthorisationResponse>;
  formerVir: Array<AuthorisationResponse>;
}

export interface ClerkTranslatorResponse
  extends ClerkTranslatorBasicInformation,
    WithId,
    WithVersion {
  authorisations: ClerkTranslatorAuthorisationsResponse;
}

export interface ClerkTranslatorAuthorisations {
  effective: Array<Authorisation>;
  expiring: Array<Authorisation>;
  expired: Array<Authorisation>;
  expiredDeduplicated: Array<Authorisation>;
  formerVir: Array<Authorisation>;
}

export interface ClerkTranslator
  extends Omit<ClerkTranslatorResponse, 'authorisations'> {
  authorisations: ClerkTranslatorAuthorisations;
}

export interface AuthorisationFilter {
  fromLang?: string;
  toLang?: string;
  authorisationBasis?: AuthorisationBasis;
  permissionToPublish?: keyof typeof PermissionToPublish;
}

export interface ClerkTranslatorFilter extends AuthorisationFilter {
  name?: string;
  authorisationStatus: AuthorisationStatus;
  emailStatus: TranslatorEmailStatus | null;
}
