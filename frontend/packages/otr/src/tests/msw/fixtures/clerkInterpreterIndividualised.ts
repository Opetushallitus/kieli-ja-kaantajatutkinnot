import { ExaminationType } from 'enums/interpreter';

export const clerkInterpreterIndividualised = {
  id: 12,
  version: 0,
  deleted: false,
  isIndividualised: true,
  identityNumber: '240256-988D',
  lastName: 'Eskola',
  firstName: 'Hanna Aada',
  nickName: 'Aada',
  email: 'aada.eskola@example.invalid',
  permissionToPublishEmail: true,
  permissionToPublishPhone: false,
  permissionToPublishOtherContactInfo: false,
  street: 'Malminkatu 1',
  postalCode: '00100',
  town: 'Helsinki',
  country: 'Suomi',
  regions: [],
  qualifications: [
    {
      id: 120,
      version: 0,
      fromLang: 'FI',
      toLang: 'EN',
      beginDate: '2022-05-14',
      endDate: '2023-11-14',
      examinationType: 'LEGAL_INTERPRETER_EXAM' as ExaminationType,
      permissionToPublish: true,
      diaryNumber: '12000',
    },
  ],
};
