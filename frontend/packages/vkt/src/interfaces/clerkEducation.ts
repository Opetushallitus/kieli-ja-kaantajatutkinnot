import { PublicFreeEnrollmentBasis } from 'interfaces/publicEducation';

export interface ClerkFreeEnrollmentBasis extends PublicFreeEnrollmentBasis {
  comment: string;
  approved: boolean;
}
