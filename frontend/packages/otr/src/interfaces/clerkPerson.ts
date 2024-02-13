import { ClerkTranslatorAddress } from 'interfaces/clerkTranslator';

export interface ClerkPerson {
  onrId: string;
  isIndividualised: boolean;
  hasIndividualisedAddress: boolean;
  identityNumber: string;
  lastName: string;
  firstName: string;
  nickName: string;
  // Optional fields
  address: Array<ClerkTranslatorAddress>;
}
