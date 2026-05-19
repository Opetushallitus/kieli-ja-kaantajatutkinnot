import { ClerkActiveQuarantineResponse } from 'interfaces/clerkQuarantine';

export const activeQuarantines: ClerkActiveQuarantineResponse[] = [
  {
    id: 1,
    startDate: '2022-12-01',
    endDate: '2025-06-01',
    languageCode: 'swe',
    quarantinedPerson: {
      firstName: 'Koira',
      lastName: 'Ihminen',
      birthdate: '1992-12-12',
      ssn: '121292A7121',
      email: 'asdasda@test.fi',
      phoneNumber: '+358401234567',
    },
  },
  {
    id: 2,
    startDate: '2023-01-15',
    endDate: '2025-09-15',
    languageCode: 'fin',
    quarantinedPerson: {
      firstName: 'Markku',
      lastName: 'Virtanen',
      birthdate: '1980-05-15',
      ssn: '150580-900T',
      email: 'markku.virtanen@ban.fi',
      phoneNumber: '+358401234567',
    },
  },
  {
    id: 3,
    startDate: '2024-03-10',
    endDate: '2026-03-10',
    languageCode: 'eng',
    quarantinedPerson: {
      firstName: 'Pirjo',
      lastName: 'Mäkinen',
      birthdate: '1975-11-03',
      ssn: '031175-812A',
      email: 'pirjo.makinen@ban.fi',
      phoneNumber: '+358509876543',
    },
  },
];
