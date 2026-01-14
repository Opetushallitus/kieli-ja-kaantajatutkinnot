import { Dayjs } from 'dayjs';
import { WithId } from 'shared/interfaces';

type LanguageLevelCode = 'PERUS' | 'KESKI' | 'YLIN';

export interface OrganizerLanguage {
  language_code: string;
  level_code: LanguageLevelCode;
}

export interface ClerkOrganizer extends WithId {
  oid: string;
  agreement_start_date?: Dayjs;
  agreement_end_date?: Dayjs;
  contact_name?: string;
  contact_email?: string;
  contact_phone_number?: string;
  languages: Array<OrganizerLanguage> | null;
  extra: string;
}

export interface ClerkOrganizerResponse
  extends Omit<ClerkOrganizer, 'agreement_start_date' | 'agreement_end_date'> {
  agreement_start_date: string;
  agreement_end_date: string;
}

export type ClerkOrganizerAddress = {
  street: string;
  zipCode: string;
  city: string;
};

// For Generic type inference
export type ClerkOrganizerType = {
  id: number;
  name: string;
  address: ClerkOrganizerAddress;
  oid: string;
  agreement_start_date?: Dayjs;
  agreement_end_date?: Dayjs;
  contact_name?: string;
  contact_email?: string;
  contact_phone_number?: string;
  languages: Array<OrganizerLanguage> | null;
  extra: string;
};
