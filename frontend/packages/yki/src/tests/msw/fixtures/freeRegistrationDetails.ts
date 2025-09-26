import { ExamLanguage, ExamLevel } from 'enums/app';
import { ClerkFreeRegistrationDetailsResponse } from 'interfaces/clerkFreeRegistration';

export const freeRegistrationDetails: ClerkFreeRegistrationDetailsResponse[] = [
  {
    id: 1,
    person: {
      fullName: 'Testi1 Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    freeRegistrationBasis: 'HIGHER_EDUCATION_DEGREE',
    freeRegistrationsLeft: 0,
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
    freeRegistrationBasis: 'HIGHER_EDUCATION_STUDIES',
    freeRegistrationsLeft: 0,
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
    freeRegistrationBasis: 'MATRICULATION_EXAMINATION',
    freeRegistrationsLeft: 0,
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
    freeRegistrationBasis: 'COMPARABLE_MATRICULATION_EXAMINATION',
    freeRegistrationsLeft: 0,
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
    freeRegistrationBasis: 'COMPARABLE_HIGHER_EDUCATION_STUDIES',
    freeRegistrationsLeft: 0,
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
    freeRegistrationBasis: 'COMPARABLE_HIGHER_EDUCATION_STUDIES',
    freeRegistrationsLeft: 0,
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
    freeRegistrationBasis: 'HIGHER_EDUCATION_DEGREE',
    freeRegistrationsLeft: 0,
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
    freeRegistrationBasis: 'HIGHER_EDUCATION_DEGREE',
    freeRegistrationsLeft: 0,
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
    freeRegistrationBasis: 'HIGHER_EDUCATION_DEGREE',
    freeRegistrationsLeft: 0,
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
    freeRegistrationBasis: 'HIGHER_EDUCATION_DEGREE',
    freeRegistrationsLeft: 0,
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
