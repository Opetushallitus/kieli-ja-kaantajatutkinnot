import {
  CertificateLanguage,
  ExamLanguage,
  ExamLevel,
  RegistrationStates,
  ServiceLanguage,
} from 'enums/app';
import {
  ClerkCustomerDetails,
  QueueOfferStatus,
} from 'interfaces/clerkCustomer';

export const customerDetails: ClerkCustomerDetails[] = [
  {
    id: 0,
    person: {
      firstName: 'Aino',
      lastName: 'Osallistuja',
      ssn: '010170-960F',
      oid: '1.2.246.562.24.82364099322',
      nationalityCode: '246',
      languageOfService: ServiceLanguage.FI,
      languageOfCertificate: CertificateLanguage.FI,
      phoneNumber: '+358 401234567',
      streetAddress: 'Katuosoite 123, 33100 Tampere',
      email: 'aino.osallistuja@loremipsum.fi',
    },
    registrations: [
      {
        examinationDate: '2025-09-01',
        exam: {
          language: ExamLanguage.FIN,
          level: ExamLevel.KESKI,
        },
        examLocation: {
          schoolName: 'Testipaikan nimi',
          municipality: 'Kajaani',
        },

        // user have paid
        registrationStatus: RegistrationStates.Completed,
        registrationDate: '2025-05-06',
      },
      {
        examinationDate: '2025-10-23',
        exam: {
          language: ExamLanguage.DEU,
          level: ExamLevel.YLIN,
        },
        examLocation: {
          schoolName: 'Lassilan koulu',
          municipality: 'Lassila',
        },
        registrationStatus: RegistrationStates.PaidAndCancelled,
        registrationDate: '2025-05-06',
      },
      {
        examinationDate: '2025-011-30',
        exam: {
          language: ExamLanguage.SME,
          level: ExamLevel.PERUS,
        },
        examLocation: {
          schoolName: 'Lorem ipsum oppilaitos',
          municipality: 'Helsinki',
        },
        registrationStatus: RegistrationStates.Cancelled,
        registrationDate: '2025-05-06',
      },
      {
        examinationDate: '2025-12-30',
        exam: {
          language: ExamLanguage.SME,
          level: ExamLevel.YLIN,
        },
        examLocation: {
          schoolName: 'Lorem ipsum oppilaitos',
          municipality: 'Helsinki',
        },
        registrationStatus: RegistrationStates.AwaitingApproval,
        registrationDate: '2025-05-06',
      },
    ],
    queuedExams: [
      {
        examinationDate: '2025-09-05',
        exam: {
          language: ExamLanguage.FIN,
          level: ExamLevel.KESKI,
        },
        examLocation: {
          schoolName: 'Testipaikan nimi',
          municipality: 'Kajaani',
        },

        // User not paid
        registrationStatus: RegistrationStates.Submitted,
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
        examLocation: {
          schoolName: 'Lassilan koulu',
          municipality: 'Lassila',
        },
        // User not paid
        registrationStatus: RegistrationStates.Submitted,
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
        examLocation: {
          schoolName: 'Lorem ipsum oppilaitos',
          municipality: 'Helsinki',
        },
        registrationStatus: RegistrationStates.Cancelled,
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
        examLocation: {
          schoolName: 'Lorem ipsum oppilaitos',
          municipality: 'Helsinki',
        },
        registrationStatus: RegistrationStates.AwaitingApproval,
        registrationDate: '2025-05-06',
        queueSpotOffered: {
          offered: QueueOfferStatus.NotOffered,
        },
      },
    ],
    pastExams: [
      {
        examinationDate: '2025-07-20',
        exam: {
          language: ExamLanguage.FIN,
          level: ExamLevel.PERUS,
        },
        examLocation: {
          schoolName: 'Testipaikan nimi',
          municipality: 'Kajaani',
        },
        state: 'REVIEWED',
      },
      {
        examinationDate: '2025-03-25',
        exam: {
          language: ExamLanguage.SWE,
          level: ExamLevel.KESKI,
        },
        examLocation: {
          schoolName: 'Lassilan koulu',
          municipality: 'Lassila',
        },
        state: 'CANCELLED',
      },
      {
        examinationDate: '2025-03-25',
        exam: {
          language: ExamLanguage.SWE,
          level: ExamLevel.KESKI,
        },
        examLocation: {
          schoolName: 'Lorem ipsum oppilaitos',
          municipality: 'Helsinki',
        },
        state: 'REGISTERED',
      },
    ],
  },
];
