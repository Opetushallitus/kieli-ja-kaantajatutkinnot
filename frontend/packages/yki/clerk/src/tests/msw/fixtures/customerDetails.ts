import {
  ExamLanguage,
  ExamLevel,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';
import {
  ClerkCustomerDetailsResponse,
  RegistrationResponse,
} from 'interfaces/clerkCustomer';

const kajaani = [
  {
    name: 'Testipaikan nimi',
    municipality: 'Kajaani',
    lang: 'fi',
  },
  {
    name: 'Provplatsens namn',
    municipality: 'Kajana',
    lang: 'sv',
  },
  {
    name: 'Test site name',
    municipality: 'Kajaani',
    lang: 'en',
  },
];

const lassila = [
  {
    name: 'Lassilan koulu',
    municipality: 'Lassila',
    lang: 'fi',
  },
  {
    name: 'Lassila skola',
    municipality: 'Lassila',
    lang: 'sv',
  },
  {
    name: 'Lassila School',
    municipality: 'Lassila',
    lang: 'en',
  },
];

const helsinki = [
  {
    name: 'Lorem ipsum oppilaitos',
    municipality: 'Helsinki',
    lang: 'fi',
  },
  {
    name: 'Lorem ipsum läroanstalt',
    municipality: 'Helsingfors',
    lang: 'sv',
  },
  {
    name: 'Lorem ipsum educational institute',
    municipality: 'Helsinki',
    lang: 'en',
  },
];

// Ilmoittautunut
const defaultAdmissionedRegistrations: RegistrationResponse[] = [
  {
    id: 1,
    examDate: '2035-09-01',
    exam: {
      id: 1,
      language: ExamLanguage.FIN,
      level: ExamLevel.KESKI,
    },
    examLocation: kajaani,

    // user have paid
    registrationState: RegistrationStates.Completed,
    examPaymentPaidAt: '2035-05-01',
    registrationDate: '2035-05-06',
    kind: RegistrationKind.Admission,
  },
  {
    id: 2,
    examDate: '2035-10-23',
    exam: {
      id: 2,
      language: ExamLanguage.DEU,
      level: ExamLevel.YLIN,
    },
    examLocation: lassila,
    registrationState: RegistrationStates.PaidAndCancelled,
    registrationDate: '2035-05-06',
    kind: RegistrationKind.Admission,
  },
  {
    id: 3,
    examDate: '2035-11-30',
    exam: {
      id: 3,
      language: ExamLanguage.SME,
      level: ExamLevel.PERUS,
    },
    examLocation: helsinki,
    registrationState: RegistrationStates.Cancelled,
    registrationDate: '2035-05-06',
    kind: RegistrationKind.Admission,
  },
  {
    id: 4,
    examDate: '2035-12-30',
    exam: {
      id: 4,
      language: ExamLanguage.SME,
      level: ExamLevel.YLIN,
    },
    examLocation: helsinki,
    registrationState: RegistrationStates.Submitted,
    registrationDate: '2035-05-06',
    kind: RegistrationKind.Admission,
    liftedFromQueueAt: '2035-05-06', // kentässä on arvo => jonopaikkaa tarjottu
  },
];

// Jonossa
const defaultQueuedRegistrations: RegistrationResponse[] = [
  {
    id: 5,
    examDate: '2035-09-05',
    exam: {
      id: 5,
      language: ExamLanguage.FIN,
      level: ExamLevel.KESKI,
    },
    examLocation: kajaani,

    // User not paid
    registrationState: RegistrationStates.Submitted,
    registrationDate: '2035-05-06',
    kind: RegistrationKind.Queue,
    expiresAt: '2035-09-20',
  },
  {
    id: 6,
    examDate: '2035-10-18',
    exam: {
      id: 6,
      language: ExamLanguage.DEU,
      level: ExamLevel.YLIN,
    },
    examLocation: lassila,
    // User not paid
    registrationState: RegistrationStates.Expired,
    registrationDate: '2035-05-06',
    kind: RegistrationKind.Queue,
    expiresAt: '2035-08-04',
  },
  {
    id: 7,
    examDate: '2035-11-22',
    exam: {
      id: 7,
      language: ExamLanguage.SWE,
      level: ExamLevel.PERUS,
    },
    examLocation: helsinki,
    registrationState: RegistrationStates.Cancelled,
    registrationDate: '2035-05-06',
    kind: RegistrationKind.Queue,
  },
  {
    id: 8,
    examDate: '2035-11-22',
    exam: {
      id: 8,
      language: ExamLanguage.SWE,
      level: ExamLevel.PERUS,
    },
    examLocation: helsinki,
    registrationState: RegistrationStates.Submitted,
    registrationDate: '2035-05-06',
    kind: RegistrationKind.Queue,
  },
];

// Menneet
const defaultPastRegistrations: RegistrationResponse[] = [
  {
    id: 9,
    examDate: '2015-07-20',
    exam: {
      id: 9,
      language: ExamLanguage.FIN,
      level: ExamLevel.PERUS,
    },
    examLocation: kajaani,
    registrationState: 'REVIEWED',
    registrationDate: '2015-05-06', // Ei näytetä "menneet - tutkinnot" - näkymässä
    kind: RegistrationKind.Admission, // Ei näytetä menneet - tutkinnot - näkymässä
  },
  {
    id: 10,
    examDate: '2015-03-25',
    exam: {
      id: 10,
      language: ExamLanguage.SWE,
      level: ExamLevel.KESKI,
    },
    examLocation: lassila,
    registrationState: 'CANCELLED',
    registrationDate: '2015-05-06', // Ei näytetä "menneet - tutkinnot" - näkymässä
    kind: RegistrationKind.Queue, // Ei näytetä menneet - tutkinnot - näkymässä
  },
  {
    id: 11,
    examDate: '2015-03-25',
    exam: {
      id: 11,
      language: ExamLanguage.SWE,
      level: ExamLevel.KESKI,
    },
    examLocation: helsinki,
    registrationState: 'REGISTERED',
    registrationDate: '2015-05-06', // Ei näytetä "menneet - tutkinnot" - näkymässä
    kind: RegistrationKind.Admission, // Ei näytetä "menneet - tutkinnot" - näkymässä
  },
];

export const customerDetails: ClerkCustomerDetailsResponse[] = [
  {
    person: {
      firstName: 'Jori Testi',
      lastName: 'Häkkinen-Testi',
      ssn: '280105A911J',
      oid: '1.2.246.562.24.82364099322',
      nationalityCode: '246',
      phoneNumber: '+358 401234567',
      streetAddress: 'Katuosoite 123',
      zip: '33100',
      postOffice: 'Tampere',
      email: 'aino.osallistuja@loremipsum.fi',
    },
    registrations: [
      ...defaultAdmissionedRegistrations,
      ...defaultQueuedRegistrations,
      ...defaultPastRegistrations,
    ],
  },
  {
    person: {
      firstName: 'Aino',
      lastName: 'Osallistuja',
      ssn: '010170-960F',
      oid: '1.2.246.562.24.82364099323',
      nationalityCode: '246',
      phoneNumber: '+358 401234567',
      streetAddress: 'Katuosoite 123',
      zip: '33100',
      postOffice: 'Tampere',
      email: 'aino.osallistuja@loremipsum.fi',
    },
    registrations: [],
  },
  {
    person: {
      firstName: 'Aino',
      lastName: 'Osallistuja',
      ssn: '010170-960F',
      oid: '1.2.246.562.24.82364099324',
      nationalityCode: '246',
    },
    registrations: [
      ...defaultAdmissionedRegistrations,
      ...defaultQueuedRegistrations,
      ...defaultPastRegistrations,
    ],
  },
];
