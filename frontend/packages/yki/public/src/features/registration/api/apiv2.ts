import axios from 'configs/axios';
import {
  PublicRegistrationInitResponse,
  RegistrationKey,
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
  axios.post<PublicRegistrationInitResponse>(
    RegistrationAPI.Init,
    SerializationUtils.serializePublicRegistrationInitRequest(selection),
  );
export const getRegistrationDetails = (key: RegistrationKey) =>
  axios.get<PublicRegistrationInitResponse>(registrationEndpoint(key));
export const submitRegistrationRequest = (
  key: RegistrationKey,
  body: unknown,
) =>
  axios.post<PublicRegistrationInitResponse>(
    `${registrationEndpoint(key)}/submit`,
    body,
  );
export const cancelRegistrationRequest = (key: RegistrationKey) =>
  axios.delete(registrationEndpoint(key));
