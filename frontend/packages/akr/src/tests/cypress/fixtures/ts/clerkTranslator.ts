import { AuthorisationBasisEnum } from 'enums/clerkTranslator';

const expiredAuthorisations = [
  {
    id: 10000,
    version: 0,
    languagePair: {
      from: 'SEKO',
      to: 'CS',
    },
    basis: AuthorisationBasisEnum.AUT,
    permissionToPublish: true,
    diaryNumber: '10000',
    termBeginDate: '2021-03-09',
    termEndDate: '2021-09-09',
    examinationDate: '2022-03-07',
  },
  {
    id: 10002,
    version: 0,
    languagePair: {
      from: 'CS',
      to: 'SEKO',
    },
    basis: AuthorisationBasisEnum.AUT,
    permissionToPublish: true,
    diaryNumber: '10002',
    termBeginDate: '2020-01-01',
    termEndDate: '2022-01-01',
    examinationDate: '2020-01-01',
  },
];

export const translatorResponse = {
  id: 2,
  version: 0,
  firstName: 'Ilkka',
  lastName: 'Eskola',
  identityNumber: 'id2',
  email: 'translator2@example.invalid',
  phoneNumber: '+358401000002',
  street: 'Sibeliuksenkuja 3',
  postalCode: '06100',
  town: 'Hämeenlinna',
  country: 'FIN',
  extraInformation:
    'Osoitetietoja muokattu 1.5.1999. Osoitetietoja muutettu uudelleen 2.5.1999.',
  isAssuranceGiven: true,
  authorisations: {
    effective: [
      {
        id: 10001,
        version: 0,
        languagePair: {
          from: 'CS',
          to: 'SEKO',
        },
        basis: AuthorisationBasisEnum.AUT,
        permissionToPublish: true,
        diaryNumber: '10001',
        termBeginDate: '2022-01-01',
        termEndDate: '2022-07-01',
        examinationDate: '2022-03-03',
      },
    ],
    expiring: [],
    expired: expiredAuthorisations,
    expiredDeduplicated: expiredAuthorisations,
    formerVir: [
      {
        id: 10003,
        version: 0,
        languagePair: {
          from: 'CS',
          to: 'SEKO',
        },
        basis: AuthorisationBasisEnum.VIR,
        permissionToPublish: true,
        diaryNumber: '10003',
      },
    ],
  },
};

export const newAuthorisation = {
  id: 10004,
  version: 0,
  languagePair: {
    from: 'FI',
    to: 'SV',
  },
  basis: AuthorisationBasisEnum.KKT,
  permissionToPublish: false,
  diaryNumber: '1337',
  termBeginDate: '2022-01-01',
  termEndDate: '2022-07-01',
};
