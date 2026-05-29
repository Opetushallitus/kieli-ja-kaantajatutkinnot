import { Dayjs } from 'dayjs';
import { ComboBoxOption } from 'shared/interfaces';

export interface ClerkStatisticsFilterState {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  languages: ComboBoxOption[];
  levels: ComboBoxOption[];
  organizers: ComboBoxOption[];
  municipality: string;
  registrationStatuses: ComboBoxOption[];
}

export interface ClerkStatisticsExportParams {
  from: string;
  to: string;
  languages: string[];
  levels: string[];
  organizers: string[];
  municipality: string;
  states: string[];
}
