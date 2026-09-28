import axios from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { PublicRegistrationInitPayload } from 'interfaces/publicRegistration';
import {
  RegistrationContext,
  RegistrationInitRequest,
  RegistrationKey,
  RegistrationSubmitRequest,
} from 'interfaces/registrationContext';
import { SerializationUtils } from 'utils/serialization';

export const registrationEndpoint = (key: RegistrationKey) =>
  APIEndpoints.Registration.replace(
    ':examSessionId',
    String(key.examSessionId),
  ).replace(':registrationId', String(key.registrationId));
export const initRegistrationRequest = (
  selection: PublicRegistrationInitPayload,
) =>
  axios.post<RegistrationContext>(
    APIEndpoints.InitRegistration,
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
