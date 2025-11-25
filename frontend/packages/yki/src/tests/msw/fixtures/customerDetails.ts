import {
  ExamLanguage,
  ExamLevel,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';
import {
  ClerkCustomerDetailsResponse,
  PastExamResponse,
  QueueOfferStatus,
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
const defaultRegistrations: RegistrationResponse[] = [
  {
    examinationDate: '2025-09-01T00:00:00.000Z',
    exam: {
      language: ExamLanguage.FIN,
      level: ExamLevel.KESKI,
    },
    examLocation: kajaani,

    // user have paid
    registrationStatus: {
      state: RegistrationStates.Completed,
      paidAt: '2025-05-01',
    },
    registrationDate: '2025-05-06',
    kind: RegistrationKind.Admission,
  },
  {
    examinationDate: '2025-10-23',
    exam: {
      language: ExamLanguage.DEU,
      level: ExamLevel.YLIN,
    },
    examLocation: lassila,
    registrationStatus: {
      state: RegistrationStates.PaidAndCancelled,
    },
    registrationDate: '2025-05-06',
    kind: RegistrationKind.Admission,
  },
  {
    examinationDate: '2025-011-30',
    exam: {
      language: ExamLanguage.SME,
      level: ExamLevel.PERUS,
    },
    examLocation: helsinki,
    registrationStatus: {
      state: RegistrationStates.Cancelled,
    },
    registrationDate: '2025-05-06',
    kind: RegistrationKind.Admission,
  },
  {
    examinationDate: '2025-12-30',
    exam: {
      language: ExamLanguage.SME,
      level: ExamLevel.YLIN,
    },
    examLocation: helsinki,
    registrationStatus: {
      state: RegistrationStates.Submitted,
    },
    registrationDate: '2025-05-06',
    kind: RegistrationKind.Admission,
  },
];

// Jonossa
const defaultQueuedExams: RegistrationResponse[] = [
  {
    examinationDate: '2025-09-05',
    exam: {
      language: ExamLanguage.FIN,
      level: ExamLevel.KESKI,
    },
    examLocation: kajaani,

    // User not paid
    registrationStatus: {
      state: RegistrationStates.Submitted,
    },
    registrationDate: '2025-05-06',
    kind: RegistrationKind.Queue,
    expiresAt: '2025-09-20',
  },
  {
    examinationDate: '2025-10-18',
    exam: {
      language: ExamLanguage.DEU,
      level: ExamLevel.YLIN,
    },
    examLocation: lassila,
    // User not paid
    registrationStatus: {
      state: RegistrationStates.Expired,
    },
    registrationDate: '2025-05-06',
    kind: RegistrationKind.Queue,
    expiresAt: '2025-08-04',
  },
  {
    examinationDate: '2025-11-22',
    exam: {
      language: ExamLanguage.SWE,
      level: ExamLevel.PERUS,
    },
    examLocation: helsinki,
    registrationStatus: {
      state: RegistrationStates.Cancelled,
    },
    registrationDate: '2025-05-06',
    kind: RegistrationKind.Queue,
  },
  {
    examinationDate: '2025-11-22',
    exam: {
      language: ExamLanguage.SWE,
      level: ExamLevel.PERUS,
    },
    examLocation: helsinki,
    registrationStatus: {
      state: RegistrationStates.Submitted,
    },
    registrationDate: '2025-05-06',
    kind: RegistrationKind.Queue,
    liftedFromQueueAt: '2025-05-06', // kentässä on arvo => jonopaikkaa tarjottu
  },
];

// Menneet
const defaultPastExams: RegistrationResponse[] = [
  {
    examinationDate: '2025-07-20',
    exam: {
      language: ExamLanguage.FIN,
      level: ExamLevel.PERUS,
    },
    examLocation: kajaani,
    registrationStatus: {
      state: 'REVIEWED',
    },
    registrationDate: '2025-05-06', // Ei näytetä "menneet - tutkinnot" - näkymässä
    kind: RegistrationKind.Admission, // Ei näytetä menneet - tutkinnot - näkymässä
  },
  {
    examinationDate: '2025-03-25',
    exam: {
      language: ExamLanguage.SWE,
      level: ExamLevel.KESKI,
    },
    examLocation: lassila,
    registrationStatus: {
      state: 'CANCELLED',
    },
    registrationDate: '2025-05-06', // Ei näytetä "menneet - tutkinnot" - näkymässä
    kind: RegistrationKind.Queue, // Ei näytetä menneet - tutkinnot - näkymässä
  },
  {
    examinationDate: '2025-03-25',
    exam: {
      language: ExamLanguage.SWE,
      level: ExamLevel.KESKI,
    },
    examLocation: helsinki,
    registrationStatus: {
      state: 'REGISTERED',
    },
    registrationDate: '2025-05-06', // Ei näytetä "menneet - tutkinnot" - näkymässä
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
      streetAddress: 'Katuosoite 123, 33100 Tampere',
      email: 'aino.osallistuja@loremipsum.fi',
    },
    registrations: [
      ...defaultRegistrations,
      ...defaultQueuedExams,
      ...defaultPastExams,
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
      streetAddress: 'Katuosoite 123, 33100 Tampere',
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
      ...defaultRegistrations,
      ...defaultQueuedExams,
      ...defaultPastExams,
    ],
  },
];
