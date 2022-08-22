import { AxiosError } from 'axios';
import { APIResponseStatus } from 'shared/enums';

export interface ResponseState {
  status: APIResponseStatus;
  error?: AxiosError;
}
