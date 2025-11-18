import { ExamLanguage, ExamLevel, RegistrationStates } from 'enums/app';
import {
  ClerkCustomerDetailsResponse,
  PastExamResponse,
  QueueOfferStatus,
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

const defaultRegistrations = [
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
  },
];

const defaultQueuedExams = [
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
    queueSpotOffered: {
      offered: QueueOfferStatus.Offered,
      dueDate: '2025-09-20',
    },
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
    queueSpotOffered: {
      offered: QueueOfferStatus.NotAccepted,
      dueDate: '2025-08-04',
    },
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
    queueSpotOffered: {
      offered: QueueOfferStatus.NotOffered,
    },
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
    queueSpotOffered: {
      offered: QueueOfferStatus.NotOffered,
    },
  },
];

const defaultPastExams: PastExamResponse[] = [
  {
    examinationDate: '2025-07-20',
    exam: {
      language: ExamLanguage.FIN,
      level: ExamLevel.PERUS,
    },
    examLocation: kajaani,
    state: 'REVIEWED',
  },
  {
    examinationDate: '2025-03-25',
    exam: {
      language: ExamLanguage.SWE,
      level: ExamLevel.KESKI,
    },
    examLocation: lassila,
    state: 'CANCELLED',
  },
  {
    examinationDate: '2025-03-25',
    exam: {
      language: ExamLanguage.SWE,
      level: ExamLevel.KESKI,
    },
    examLocation: helsinki,
    state: 'REGISTERED',
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
    registrations: defaultRegistrations,
    queuedExams: defaultQueuedExams,
    pastExams: defaultPastExams,
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
    queuedExams: [],
    pastExams: [],
  },
  {
    person: {
      firstName: 'Aino',
      lastName: 'Osallistuja',
      ssn: '010170-960F',
      oid: '1.2.246.562.24.82364099324',
      nationalityCode: '246',
    },
    registrations: defaultRegistrations,
    queuedExams: defaultQueuedExams,
    pastExams: defaultPastExams,
  },
];
