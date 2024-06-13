export interface Education {
  name: string;
  ongoing: boolean;
}

interface Attachment {
  name: string;
  id: string;
}

export interface PublicEducationResponse {
  educationType: string;
  isActive: boolean;
}

export interface PublicFreeEnrollmentBasis {
  type: string;
  source: string;
  attachments?: Array<Attachment>;
}

export interface PublicFreeEnrollmentDetails {
  freeOralSkillLeft: 0 | 1 | 2 | 3;
  freeTextualSkillLeft: 0 | 1 | 2 | 3;
}

export type HandleChange = (
  isFree: boolean,
  feeEnrollmentBasis?: PublicFreeEnrollmentBasis,
) => void;
