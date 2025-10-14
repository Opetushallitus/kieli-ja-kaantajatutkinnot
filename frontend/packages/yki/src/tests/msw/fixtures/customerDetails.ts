import {
  CertificateLanguage,
  ExamLanguage,
  ExamLevel,
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
      name: 'Osallistuja Aino',
      oid: '1.2.246.562.24.82364099322',
      nationality: 'Suomi',
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
        registrationStatus: 'PAID',
        registrationDate: '2025-05-06',
      },
      {
        examinationDate: '2025-10-23',
        exam: {
          language: ExamLanguage.DEU,
          level: ExamLevel.YLIN,
        },
        examLocation: 'Lassilan koulu\nLassila',
        registrationStatus: 'PAID_CANCELLED',
        registrationDate: '2025-05-06',
      },
      {
        examinationDate: '2025-011-30',
        exam: {
          language: ExamLanguage.SME,
          level: ExamLevel.PERUS,
        },
        examLocation: 'Lorem ipsum oppilaitos\nHelsinki',
        registrationStatus: 'CANCELLED',
        registrationDate: '2025-05-06',
      },
      {
        examinationDate: '2025-12-30',
        exam: {
          language: ExamLanguage.SME,
          level: ExamLevel.YLIN,
        },
        examLocation: 'Lorem ipsum oppilaitos\nHelsinki',
        registrationStatus: 'CHECK_IN_PROGRESS',
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
        registrationStatus: 'NOT_PAID',
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
          level: ExamLevel.KESKI,
        },
        examLocation: 'Lassilan koulu\nLassila',
        registrationStatus: 'OVERDUE',
        registrationDate: '2025-05-06',
        queueSpotOffered: {
          offered: false,
          dueDate: '2025-09-20',
        },
      },
    ],
    pastExams: [
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
        state: 'REVIEWED',
      },
    ],
  },
];
