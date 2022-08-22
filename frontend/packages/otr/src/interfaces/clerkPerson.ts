export interface ClerkPerson {
  onrId: string;
  isIndividualised: boolean;
  identityNumber: string;
  lastName: string;
  firstName: string;
  nickName: string;
  // Optional fields
  street?: string;
  postalCode?: string;
  town?: string;
  country?: string;
}
