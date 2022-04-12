import { Action } from 'redux';

import { APIResponseStatus } from 'enums/api';
import {
  ClerkTranslator,
  ClerkTranslatorFilter,
  ClerkTranslatorResponse,
} from 'interfaces/clerkTranslator';
import { LanguagePairsDict } from 'interfaces/languagePair';
import { MeetingDate, MeetingDateResponse } from 'interfaces/meetingDate';

export interface ClerkState {
  translators: Array<ClerkTranslator>;
  langs: LanguagePairsDict;
  meetingDates: Array<MeetingDate>;
}

export interface ClerkStateResponse {
  translators: Array<ClerkTranslatorResponse>;
  langs: LanguagePairsDict;
  towns: Array<string>;
  meetingDates: Array<MeetingDateResponse>;
}

export interface ClerkUIState extends ClerkState {
  selectedTranslators: Array<number>;
  status: APIResponseStatus;
  filters: ClerkTranslatorFilter;
}

export interface ClerkStateAction extends Action<string>, Partial<ClerkState> {
  index?: number;
  filters?: ClerkTranslatorFilter;
}
