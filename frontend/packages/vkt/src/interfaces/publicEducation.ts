export interface Education {
  name: string;
  ongoing: boolean;
}

export interface PublicEducationResponse {
  educationType: string;
  isActive: boolean;
}

export interface PublicFreeEnrollmentDetails {
  freeOralSkillLeft: 0 | 1 | 2 | 3;
  freeTextualSkillLeft: 0 | 1 | 2 | 3;
}
