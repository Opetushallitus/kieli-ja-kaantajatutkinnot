import { ExamLanguage, ExamLevel } from 'enums/app';
import { ClerkFreeEnrollmentDetailsResponse } from 'interfaces/clerkFreeEnrollment';

export const freeEnrollmentDetails: ClerkFreeEnrollmentDetailsResponse[] = [
  {
    id: 1,
    person: {
      fullName: 'Testi1 Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    freeEnrollmentBasis: 'HIGHER_EDUCATION_DEGREE',
    freeEnrollmentsLeft: 0,
    examSession: {
      id: 1,
      language: ExamLanguage.FIN,
      level: ExamLevel.KESKI,
      examDate: '2025-11-22T00:00:00.000Z',
    },
    languageOfCommunication: 'fi',
    registration: {
      kind: 'ADMISSION',
    },
    attachments: [
      {
        id: 1,
        filename: 'testi.pdf',
        url: 'http://localhost/testi.pdf',
        submittedAt: '2024-10-10T00:00:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 2,
    person: {
      fullName: 'Testi2 Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139522',
    },
    status: 'PENDING',
    freeEnrollmentBasis: 'HIGHER_EDUCATION_STUDIES',
    freeEnrollmentsLeft: 0,
    examSession: {
      id: 1,
      language: ExamLanguage.SWE,
      level: ExamLevel.KESKI,
      examDate: '2025-11-22T00:00:00.000Z',
    },
    languageOfCommunication: 'en',
    registration: {
      kind: 'ADMISSION',
    },
    attachments: [
      {
        id: 1,
        filename: 'testi.pdf',
        url: 'http://localhost/testi.pdf',
        submittedAt: '2024-10-10T00:00:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 3,
    person: {
      fullName: 'Testi3 Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139533',
    },
    status: 'APPROVED',
    freeEnrollmentBasis: 'MATRICULATION_EXAMINATION',
    freeEnrollmentsLeft: 0,
    assessmentDate: '2025-11-10T00:00:00.000Z',
    examSession: {
      id: 1,
      language: ExamLanguage.SWE,
      level: ExamLevel.KESKI,
      examDate: '2025-11-22T00:00:00.000Z',
    },
    languageOfCommunication: 'en',
    registration: {
      kind: 'QUEUE',
      positionInQueue: 5,
      queue: 20,
    },
    attachments: [
      {
        id: 1,
        filename: 'testi.pdf',
        url: 'http://localhost/testi.pdf',
        submittedAt: '2024-10-10T00:00:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 4,
    person: {
      fullName: 'Testi4 Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139544',
    },
    status: 'REJECTED',
    freeEnrollmentBasis: 'COMPARABLE_MATRICULATION_EXAMINATION',
    freeEnrollmentsLeft: 0,
    assessmentDate: '2025-11-10T00:00:00.000Z',
    examSession: {
      id: 1,
      language: ExamLanguage.SWE,
      level: ExamLevel.KESKI,
      examDate: '2025-11-22T00:00:00.000Z',
    },
    languageOfCommunication: 'en',
    registration: {
      kind: 'QUEUE',
      positionInQueue: 1,
      queue: 5,
    },
    attachments: [
      {
        id: 1,
        filename: 'testi.pdf',
        url: 'http://localhost/testi.pdf',
        submittedAt: '2024-10-10T00:00:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 5,
    person: {
      fullName: 'Testi5 Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139555',
    },
    status: 'INFORMATION_REQUESTED',
    freeEnrollmentBasis: 'COMPARABLE_HIGHER_EDUCATION_STUDIES',
    freeEnrollmentsLeft: 0,
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examSession: {
      id: 1,
      language: ExamLanguage.SWE,
      level: ExamLevel.KESKI,
      examDate: '2025-11-22T00:00:00.000Z',
    },
    languageOfCommunication: 'en',
    registration: {
      kind: 'ADMISSION',
    },
    attachments: [
      {
        id: 1,
        filename: 'testi.pdf',
        url: 'http://localhost/testi.pdf',
        submittedAt: '2024-10-10T00:00:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 6,
    person: {
      fullName: 'Testi6 Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139555',
    },
    status: 'INFORMATION_REQUEST_ANSWERED',
    freeEnrollmentBasis: 'COMPARABLE_HIGHER_EDUCATION_STUDIES',
    freeEnrollmentsLeft: 0,
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examSession: {
      id: 1,
      language: ExamLanguage.SWE,
      level: ExamLevel.KESKI,
      examDate: '2025-11-22T00:00:00.000Z',
    },
    languageOfCommunication: 'en',
    registration: {
      kind: 'ADMISSION',
    },
    attachments: [
      {
        id: 1,
        filename: 'testi.pdf',
        url: 'http://localhost/testi.pdf',
        submittedAt: '2024-10-10T00:00:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 7,
    person: {
      fullName: 'Testi7 Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    freeEnrollmentBasis: 'HIGHER_EDUCATION_DEGREE',
    freeEnrollmentsLeft: 0,
    examSession: {
      id: 1,
      language: ExamLanguage.FIN,
      level: ExamLevel.KESKI,
      examDate: '2025-11-22T00:00:00.000Z',
    },
    languageOfCommunication: 'fi',
    registration: {
      kind: 'ADMISSION',
    },
    attachments: [
      {
        id: 1,
        filename: 'testi.pdf',
        url: 'http://localhost/testi.pdf',
        submittedAt: '2024-10-10T00:00:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 8,
    person: {
      fullName: 'Testi8 Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    freeEnrollmentBasis: 'HIGHER_EDUCATION_DEGREE',
    freeEnrollmentsLeft: 0,
    examSession: {
      id: 1,
      language: ExamLanguage.FIN,
      level: ExamLevel.KESKI,
      examDate: '2025-11-22T00:00:00.000Z',
    },
    languageOfCommunication: 'fi',
    registration: {
      kind: 'ADMISSION',
    },
    attachments: [
      {
        id: 1,
        filename: 'testi.pdf',
        url: 'http://localhost/testi.pdf',
        submittedAt: '2024-10-10T00:00:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 9,
    person: {
      fullName: 'Testi9 Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    freeEnrollmentBasis: 'HIGHER_EDUCATION_DEGREE',
    freeEnrollmentsLeft: 0,
    examSession: {
      id: 1,
      language: ExamLanguage.FIN,
      level: ExamLevel.KESKI,
      examDate: '2025-11-22T00:00:00.000Z',
    },
    languageOfCommunication: 'fi',
    registration: {
      kind: 'ADMISSION',
    },
    attachments: [
      {
        id: 1,
        filename: 'testi.pdf',
        url: 'http://localhost/testi.pdf',
        submittedAt: '2024-10-10T00:00:00.000Z',
      },
    ],
    comments: [],
  },
  {
    id: 10,
    person: {
      fullName: 'Testi10 Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    freeEnrollmentBasis: 'HIGHER_EDUCATION_DEGREE',
    freeEnrollmentsLeft: 0,
    examSession: {
      id: 1,
      language: ExamLanguage.FIN,
      level: ExamLevel.KESKI,
      examDate: '2025-11-22T00:00:00.000Z',
    },
    languageOfCommunication: 'fi',
    registration: {
      kind: 'ADMISSION',
    },
    attachments: [
      {
        id: 1,
        filename: 'testi.pdf',
        url: 'http://localhost/testi.pdf',
        submittedAt: '2024-10-10T00:00:00.000Z',
      },
    ],
    comments: [],
  },
];
