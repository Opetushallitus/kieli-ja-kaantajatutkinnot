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
  nickName: 'Ilkka',
  identityNumber: 'id2',
  email: 'translator2@example.invalid',
  phoneNumber: '+358401000002',
  address: [
    {
      street: 'Sibeliuksenkuja 3',
      postalCode: '06100',
      town: 'Hämeenlinna',
      country: 'FIN',
      source: 'alkupera8',
      type: 'yhteystietotyyppi14',
      selected: true,
    },
  ],
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

export const translatorFromOnrResponse = {
  id: 3,
  version: 0,
  isIndividualised: true,
  hasIndividualisedAddress: true,
  firstName: 'Antti Kalle',
  lastName: 'Alanen',
  nickName: 'Antti',
  identityNumber: '260875-9507',
  email: 'antti.alanen@example.invalid',
  phoneNumber: '+358401000002',
  address: [
    {
      street: 'Sibeliuksenkuja 3',
      postalCode: '06100',
      town: 'Hämeenlinna',
      country: 'FIN',
      source: 'alkupera8',
      type: 'yhteystietotyyppi14',
      selected: false,
      autoSelected: true,
    },
    {
      street: 'Runebergintie 2',
      postalCode: '01200',
      town: 'Turku',
      country: 'suomi',
      source: 'alkupera1',
      type: 'yhteystietotyyppi4',
      selected: true,
      autoSelected: false,
    },
  ],
  extraInformation:
    'Osoitetietoja muokattu 1.5.1999. Osoitetietoja muutettu uudelleen 2.5.1999. Uusi auktorisointi lisätty kääntäjälle 12.10.2000. Auktorisointi päivitetty julkiseksi 1.1.2001. Viimeisen muutoksen tekijä: Testi Testinen',
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

export const translatorFromOnrResponseNoAkrAddress = {
  id: 4,
  version: 0,
  isIndividualised: true,
  hasIndividualisedAddress: true,
  firstName: 'Antti Kalle',
  lastName: 'Alanen',
  nickName: 'Antti',
  identityNumber: '260875-9507',
  email: 'antti.alanen@example.invalid',
  phoneNumber: '+358401000002',
  address: [
    {
      street: 'Sibeliuksenkuja 3',
      postalCode: '06100',
      town: 'Hämeenlinna',
      country: 'FIN',
      source: 'alkupera1',
      type: 'yhteystietotyyppi5',
      selected: false,
      autoSelected: true,
    },
    {
      street: 'Runebergintie 2',
      postalCode: '01200',
      town: 'Turku',
      country: 'suomi',
      source: 'alkupera1',
      type: 'yhteystietotyyppi4',
      selected: true,
      autoSelected: false,
    },
  ],
  extraInformation:
    'Osoitetietoja muokattu 1.5.1999. Osoitetietoja muutettu uudelleen 2.5.1999. Uusi auktorisointi lisätty kääntäjälle 12.10.2000. Auktorisointi päivitetty julkiseksi 1.1.2001. Viimeisen muutoksen tekijä: Testi Testinen',
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

export const translatorOnrAutoAddressResponse = {
  id: 5,
  version: 0,
  isIndividualised: true,
  hasIndividualisedAddress: true,
  firstName: 'Antti Kalle',
  lastName: 'Alanen',
  nickName: 'Antti',
  identityNumber: '260875-9507',
  email: 'antti.alanen@example.invalid',
  phoneNumber: '+358401000002',
  address: [
    {
      street: 'Sibeliuksenkuja 3',
      postalCode: '06100',
      town: 'Hämeenlinna',
      country: 'FIN',
      source: 'alkupera8',
      type: 'yhteystietotyyppi14',
      selected: false,
      autoSelected: false,
    },
    {
      street: 'Runebergintie 2',
      postalCode: '01200',
      town: 'Turku',
      country: 'suomi',
      source: 'alkupera1',
      type: 'yhteystietotyyppi4',
      selected: true,
      autoSelected: false,
    },
  ],
  extraInformation:
    'Osoitetietoja muokattu 1.5.1999. Osoitetietoja muutettu uudelleen 2.5.1999. Uusi auktorisointi lisätty kääntäjälle 12.10.2000. Auktorisointi päivitetty julkiseksi 1.1.2001. Viimeisen muutoksen tekijä: Testi Testinen',
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
