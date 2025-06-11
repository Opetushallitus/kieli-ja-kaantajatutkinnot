import { Dayjs } from 'dayjs';

export interface LoginLinkDetails {
  expires_at: Dayjs;
}

export interface LoginLinkDetailsResponse {
  expires_at: string;
}
