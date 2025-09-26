import { Dayjs } from 'dayjs';
import { AppLanguage } from 'shared/enums';

export interface LoginLinkDetails {
  expires_at: Dayjs;
}

export interface LoginLinkDetailsResponse {
  expires_at: string;
}

export interface LoginLinkRenewRequest {
  code: string;
  lang: AppLanguage;
}
export interface LoginLinkRenewResponse {
  success: boolean;
}
