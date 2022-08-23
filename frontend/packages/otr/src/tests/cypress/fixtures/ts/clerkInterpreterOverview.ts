import { ExaminationType } from 'enums/interpreter';

export const interpreterResponse = {
  id: 7,
  version: 0,
  deleted: false,
  isIndividualised: true,
  identityNumber: '060105A910A',
  lastName: 'Aaltonen',
  firstName: 'Anneli Anna',
  nickName: 'Anneli',
  email: 'anneli.aaltonen@example.invalid',
  permissionToPublishEmail: true,
  phoneNumber: '+358401000001',
  permissionToPublishPhone: true,
  otherContactInfo: 'Tulkintie 7, Kokkola',
  permissionToPublishOtherContactInfo: true,
  street: 'Malminkatu 1',
  postalCode: '00100',
  town: 'Helsinki',
  country: 'Suomi',
  regions: [],
  qualifications: [
    {
      id: 7,
      version: 0,
      fromLang: 'FI',
      toLang: 'KO',
      beginDate: '2022-05-14',
      endDate: '2023-11-14',
      examinationType: 'LEGAL_INTERPRETER_EXAM' as ExaminationType,
      permissionToPublish: true,
      diaryNumber: '12347',
    },
    {
      id: 8,
      version: 0,
      fromLang: 'FI',
      toLang: 'SV',
      beginDate: '2022-05-14',
      endDate: '2023-11-14',
      examinationType: 'OTHER' as ExaminationType,
      permissionToPublish: true,
      diaryNumber: '12667',
    },
  ],
};

export const qualification = {
  id: 9,
  version: 0,
  fromLang: 'FI',
  toLang: 'SV',
  examinationType: 'LEGAL_INTERPRETER_EXAM' as ExaminationType,
  permissionToPublish: true,
  diaryNumber: '1337',
  beginDate: '2022-05-14',
  endDate: '2023-11-14',
};
