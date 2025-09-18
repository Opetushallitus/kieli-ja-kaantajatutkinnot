export const freeEnrollments = [
  {
    id: 1,
    person: {
      fullName: 'Testi Testaaja 1',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139511',
    },
    status: 'PENDING',
    dueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-22T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
  {
    id: 2,
    person: {
      fullName: 'Testi Testaaja 2',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139522',
    },
    status: 'PENDING',
    dueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-22T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
  {
    id: 3,
    person: {
      fullName: 'Testi Testaaja 3',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139533',
    },
    status: 'APPROVED',
    assessmentDate: '2025-11-10T00:00:00.000Z',
    examDate: '2025-11-22T00:00:00.000Z',
    registration: {
      kind: 'QUEUE',
      positionInQueue: 5,
    },
  },
  {
    id: 4,
    person: {
      fullName: 'Testi Testaaja 4',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139544',
    },
    status: 'REJECTED',
    assessmentDate: '2025-11-10T00:00:00.000Z',
    registration: {
      kind: 'QUEUE',
      positionInQueue: 1,
    },
  },
  {
    id: 5,
    person: {
      fullName: 'Testi Testaaja 5',
      socialSecurityNumber: '112233-9999',
      oid: '1.2.246.562.10.39706139555',
    },
    status: 'INFORMATION_REQUESTED',
    dueDate: '2025-11-11T00:00:00.000Z',
    examDate: '2025-11-22T00:00:00.000Z',
    registration: {
      kind: 'ADMISSION',
    },
  },
];
