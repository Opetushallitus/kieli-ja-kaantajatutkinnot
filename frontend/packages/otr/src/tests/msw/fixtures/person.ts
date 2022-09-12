import { ClerkPerson } from 'interfaces/clerkPerson';

export const person1: ClerkPerson = {
  onrId: '123',
  isIndividualised: true,
  hasIndividualisedAddress: false,
  identityNumber: '170378-966N',
  lastName: 'Mannonen',
  firstName: 'Anna Maria',
  nickName: 'Anna',
};

export const person2: ClerkPerson = {
  onrId: '234',
  isIndividualised: true,
  hasIndividualisedAddress: true,
  identityNumber: '090687-913J',
  lastName: 'Lehtinen',
  firstName: 'Matti Tauno',
  nickName: 'Tauno',
  street: 'Kajaanintie 123',
  postalCode: '93600',
  town: 'Kuusamo',
  country: 'FINLAND',
};
