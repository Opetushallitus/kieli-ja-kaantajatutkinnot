import { ClerkInterpreterResponse } from 'interfaces/clerkInterpreter';

export const publishPermissionChangeResponse = (
  interpreterResponse: ClerkInterpreterResponse,
  qualificationId: number,
  newPublishPermissionValue: boolean
) => {
  const updatedQualifications = interpreterResponse.qualifications.map((q) =>
    q.id === qualificationId
      ? { ...q, permissionToPublish: newPublishPermissionValue }
      : q
  );

  return {
    ...interpreterResponse,
    qualifications: updatedQualifications,
  };
};

export const qualificationRemoveResponse = (
  interpreterResponse: ClerkInterpreterResponse,
  qualificationId: number
) => {
  const updatedQualifications = interpreterResponse.qualifications.filter(
    (q) => q.id !== qualificationId
  );

  return {
    ...interpreterResponse,
    qualifications: updatedQualifications,
  };
};
