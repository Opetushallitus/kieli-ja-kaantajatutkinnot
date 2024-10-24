export const publicEnrollmentInitialisation = {
  examEvent: {
    openings: 6,
    id: 2,
    language: 'SV',
    date: '2022-03-22',
    registrationCloses: '2022-03-15',
    isHidden: false,
    hasCongestion: false,
  },
  person: {
    id: 23,
    lastName: 'Testilä',
    firstName: 'Tessa',
  },
  reservation: {
    id: 1,
    createdAt: '2022-09-27T16:00:00+0200',
    expiresAt: '2022-09-27T16:30:00+0200',
    isRenewable: true,
  },
};

export const examEventIdWithKoskiEducationDetailsFound = 234;

export const publicEnrollmentInitialisationWithFreeEnrollments = {
  ...publicEnrollmentInitialisation,
  examEvent: {
    ...publicEnrollmentInitialisation.examEvent,
    id: examEventIdWithKoskiEducationDetailsFound,
  },
  freeEnrollmentDetails: {
    freeOralSkillLeft: 3,
    freeTextualSkillLeft: 3,
  },
};
