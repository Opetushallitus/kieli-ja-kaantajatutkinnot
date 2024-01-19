import { ClerkInterpreterResponse } from 'interfaces/clerkInterpreter';

export const qualificationRemoveResponse = (
  interpreterResponse: ClerkInterpreterResponse,
  effectiveQualificationId: number,
) => {
  const effective = interpreterResponse.qualifications.effective.filter(
    (q) => q.id !== effectiveQualificationId,
  );

  return {
    ...interpreterResponse,
    qualifications: {
      ...interpreterResponse.qualifications,
      effective,
    },
  };
};
