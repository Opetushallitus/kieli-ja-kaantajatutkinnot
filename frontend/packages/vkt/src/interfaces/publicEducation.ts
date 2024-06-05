interface Education {
  name: string;
  ongoing: boolean;
}

interface FreeEnrollments {
  textualSkill: 0 | 1 | 2 | 3;
  oralSkill: 0 | 1 | 2 | 3;
}

export interface PublicFreeEnrollmentDetails {
  freeEnrollmentBasis: Education;
  freeEnrollments: FreeEnrollments;
}
