import { RegistrationStates } from 'enums/app';
import { ClerkRegistrationResponse } from 'interfaces/clerkRegistration';

export const registrations: ClerkRegistrationResponse[] = [
  {
    id: 1,
    person: {
      firstName: 'Testi1',
      lastName: 'Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    state: RegistrationStates.Completed,
    examDate: '2025-11-21T00:00:00.000Z',
    kind: 'ADMISSION',
  },
];
