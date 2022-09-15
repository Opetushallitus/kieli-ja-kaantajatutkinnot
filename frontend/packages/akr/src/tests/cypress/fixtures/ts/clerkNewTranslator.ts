export const newTranslatorResponse = {
  id: 4901,
  version: 0,
  firstName: 'Doeline',
  lastName: 'John',
  identityNumber: '010199-1337',
  email: 'john.doeline@tuntematon.fi',
  phoneNumber: '0406667777',
  street: 'Tuntemattomankatu 1',
  postalCode: '99800',
  town: 'Ivalo',
  country: 'FIN',
  extraInformation: 'Lisätiedot',
  isAssuranceGiven: true,
  authorisations: {
    effective: [
      {
        id: 13428,
        version: 0,
        languagePair: { from: 'FI', to: 'SV' },
        basis: 'KKT',
        termBeginDate: '2022-01-01',
        termEndDate: '2027-01-01',
        permissionToPublish: true,
        diaryNumber: '1337',
      },
    ],
    expiring: [],
    expired: [],
    expiredDeduplicated: [],
    formerVir: [],
  },
};
