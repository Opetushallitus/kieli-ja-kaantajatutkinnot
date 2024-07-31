export enum FreeBasisSource {
  KOSKI = 'KOSKI',
  User = 'USER',
}

export enum EducationType {
  MatriculationExam = 'MatriculationExam',
  HigherEducationEnrolled = 'HigherEducationEnrolled',
  HigherEducationConcluded = 'HigherEducationConcluded',
  DIA = 'DIA',
  EB = 'EB',
  Other = 'Other',
  Unknown = 'Unknown',
  None = 'None',
}

export interface Education {
  name: EducationType;
  ongoing: boolean;
}

export interface Attachment {
  name: string;
  id: string;
  size: number;
}

export interface PublicEducationResponse {
  educationType: string;
  isActive: boolean;
}

export interface PublicFreeEnrollmentBasis {
  type: EducationType;
  source: FreeBasisSource;
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
