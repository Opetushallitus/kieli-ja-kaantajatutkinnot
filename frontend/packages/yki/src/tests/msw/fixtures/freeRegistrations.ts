import { ClerkFreeRegistrationResponse } from 'interfaces/clerkFreeRegistration';

export const freeRegistrations: ClerkFreeRegistrationResponse[] = [
  {
    id: 1,
    person: {
      firstName: 'Testi1',
      lastName: 'Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    supplementRequestDueDate: '2025-11-12T00:00:00.000Z',
    examDate: '2025-11-21T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
  {
    id: 2,
    person: {
      firstName: 'Testi2',
      lastName: 'Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139522',
    },
    status: 'SUPPLEMENT_REQUEST_EXPIRED',
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-22T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
  {
    id: 3,
    person: {
      firstName: 'Testi3',
      lastName: 'Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139533',
    },
    status: 'APPROVED',
    assessmentDate: '2025-11-10T00:00:00.000Z',
    examDate: '2025-11-23T00:00:00.000Z',
    registration: {
      kind: 'QUEUE',
      positionInQueue: 5,
      queue: 20,
    },
  },
  {
    id: 4,
    person: {
      firstName: 'Testi4',
      lastName: 'Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139544',
    },
    status: 'REJECTED',
    assessmentDate: '2025-11-10T00:00:00.000Z',
    examDate: '2025-11-23T00:00:00.000Z',
    registration: {
      kind: 'QUEUE',
      positionInQueue: 1,
      queue: 5,
    },
  },
  {
    id: 5,
    person: {
      firstName: 'Testi5',
      lastName: 'Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139555',
    },
    status: 'SUPPLEMENT_REQUESTED',
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-22T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
  {
    id: 6,
    person: {
      firstName: 'Testi6',
      lastName: 'Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139555',
    },
    status: 'SUPPLEMENT_REQUEST_ANSWERED',
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-24T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
  {
    id: 7,
    person: {
      firstName: 'Testi7',
      lastName: 'Mestaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-27T00:00:00.000Z',
    registration: {
      kind: 'QUEUE',
      positionInQueue: 3,
      queue: 15,
    },
  },
  {
    id: 8,
    person: {
      firstName: 'Testi8',
      lastName: 'Mestaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-26T00:00:00.000Z',
    registration: {
      kind: 'QUEUE',
      positionInQueue: 5,
      queue: 8,
    },
  },
  {
    id: 9,
    person: {
      firstName: 'Testi9',
      lastName: 'Mestaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-27T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
  {
    id: 10,
    person: {
      firstName: 'Testi10',
      lastName: 'Mestaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-22T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
  {
    id: 11,
    person: {
      firstName: 'Testi11',
      lastName: 'Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-23T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
  {
    id: 12,
    person: {
      firstName: 'Testi12',
      lastName: 'Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-24T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
  {
    id: 13,
    person: {
      firstName: 'Testi13',
      lastName: 'Testaaja',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    supplementRequestDueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-25T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
];
