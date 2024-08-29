import { PublicFreeEnrollmentBasis } from 'interfaces/publicEducation';

export interface ClerkFreeEnrollmentBasis extends PublicFreeEnrollmentBasis {
  comment: string;
  approved: boolean;
  koskiEducations: KoskiEducations;
}

interface KoskiEducations {
  matriculationExam: boolean
  higherEducationConcluded: boolean;
  higherEducationEnrolled: boolean;
  eb: boolean;
  dia: boolean;
  other: boolean;
}
