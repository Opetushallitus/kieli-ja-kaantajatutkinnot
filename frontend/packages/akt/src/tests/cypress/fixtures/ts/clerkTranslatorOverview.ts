// Helpers

import { AuthorisationBasisEnum } from 'enums/clerkTranslator';
import { ClerkTranslatorResponse } from 'interfaces/clerkTranslator';
import { DateUtils } from 'utils/date';

// Used by clerk_translator_overview.spec and needs to match translator with id: 2 in clerk_translator_10.json
const translatorDetails = {
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
  country: 'SUOMI',
  extraInformation:
    'Osoitetietoja muokattu 1.5.1999. Osoitetietoja muutettu uudelleen 2.5.1999.',
  isAssuranceGiven: true,
};

const dayjs = DateUtils.dayjs();

const getDateWithProperType = (date: string, isResponse = true) =>
  isResponse ? date : dayjs(date);

const getAuthorisationDetails = (isReponse: boolean) => {
  return {
    authorisations: [
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
        termBeginDate: getDateWithProperType('2021-03-09', isReponse),
        termEndDate: getDateWithProperType('2021-09-09', isReponse),
        autDate: getDateWithProperType('2022-03-07', isReponse),
      },
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
        termBeginDate: getDateWithProperType('2022-01-01', isReponse),
        termEndDate: getDateWithProperType('2022-07-01', isReponse),
        autDate: getDateWithProperType('2022-03-03', isReponse),
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
        termBeginDate: getDateWithProperType('2020-01-01', isReponse),
        termEndDate: getDateWithProperType('2022-01-01', isReponse),
        autDate: getDateWithProperType('2020-01-01', isReponse),
      },
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
  };
};

export const translatorResponse = <ClerkTranslatorResponse>{
  ...translatorDetails,
  ...getAuthorisationDetails(true),
};

export const authorisation = {
  id: 10004,
  version: 0,
  languagePair: {
    from: 'FI',
    to: 'SV',
  },
  basis: AuthorisationBasisEnum.KKT,
  permissionToPublish: false,
  diaryNumber: '1337',
  termBeginDate: getDateWithProperType('2022-01-01'),
  termEndDate: getDateWithProperType('2022-07-01'),
};
