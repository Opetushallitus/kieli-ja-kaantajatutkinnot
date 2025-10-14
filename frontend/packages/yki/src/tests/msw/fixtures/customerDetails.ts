import {
  CertificateLanguage,
  ExamLanguage,
  ExamLevel,
  ServiceLanguage,
} from 'enums/app';
import { ClerkCustomerDetails } from 'interfaces/clerkCustomer';

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
        examLocation: 'Testipaikan nimi\nKajaani',
        registrationStatus: 'PAID',
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
        examLocation: 'Testipaikan nimi\nKajaani',
        registrationStatus: 'NOT_PAID',
        registrationDate: '2025-05-06',
        queueSpotOffered: {
          offered: true,
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
        examLocation: 'Testipaikan nimi\nKajaani',
        state: 'REVIEWED',
      },
    ],
  },
];
