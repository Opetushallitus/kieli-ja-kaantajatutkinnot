import axios from 'configs/axios';
import {
  RegistrationContext,
  RegistrationInitRequest,
  RegistrationKey,
  RegistrationSubmitRequest,
} from 'features/registration/modelv2';
import { PublicRegistrationInitPayload } from 'interfaces/publicRegistration';
import { SerializationUtils } from 'utils/serialization';

export const RegistrationAPI = {
  Init: '/yki/api/v2/registration/init',
  Details:
    '/yki/api/v2/exam-session/:examSessionId/registration/:registrationId',
  Auth: '/yki/auth/v2/registration/:examSessionId/:registrationId/:method',
} as const;
export const registrationEndpoint = (key: RegistrationKey) =>
  RegistrationAPI.Details.replace(
    ':examSessionId',
    String(key.examSessionId),
  ).replace(':registrationId', String(key.registrationId));
export const initRegistrationRequest = (
  selection: PublicRegistrationInitPayload,
) =>
  axios.post<RegistrationContext>(
    RegistrationAPI.Init,
    SerializationUtils.serializePublicRegistrationInitRequest(
      selection,
    ) satisfies RegistrationInitRequest,
  );
export const getRegistrationDetails = (key: RegistrationKey) =>
  axios.get<RegistrationContext>(registrationEndpoint(key));
export const submitRegistrationRequest = (
  key: RegistrationKey,
  body: RegistrationSubmitRequest,
) =>
  axios.post<RegistrationContext>(`${registrationEndpoint(key)}/submit`, body);
export const cancelRegistrationRequest = (key: RegistrationKey) =>
  axios.delete(registrationEndpoint(key));
