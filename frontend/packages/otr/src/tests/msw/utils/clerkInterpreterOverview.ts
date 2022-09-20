import { ClerkInterpreterResponse } from 'interfaces/clerkInterpreter';

export const publishPermissionChangeResponse = (
  interpreterResponse: ClerkInterpreterResponse,
  effectiveQualificationId: number,
  newPublishPermissionValue: boolean
) => {
  const effective = interpreterResponse.qualifications.effective.map((q) =>
    q.id === effectiveQualificationId
      ? { ...q, permissionToPublish: newPublishPermissionValue }
      : q
  );

  return {
    ...interpreterResponse,
    qualifications: {
      ...interpreterResponse.qualifications,
      effective,
    },
  };
};

export const qualificationRemoveResponse = (
  interpreterResponse: ClerkInterpreterResponse,
  effectiveQualificationId: number
) => {
  const effective = interpreterResponse.qualifications.effective.filter(
    (q) => q.id !== effectiveQualificationId
  );

  return {
    ...interpreterResponse,
    qualifications: {
      ...interpreterResponse.qualifications,
      effective,
    },
  };
};
