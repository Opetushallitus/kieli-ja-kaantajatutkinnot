import {
  ClerkTranslator,
  ClerkTranslatorResponse,
} from 'interfaces/clerkTranslator';
import {
  ExaminationDate,
  ExaminationDateResponse,
} from 'interfaces/examinationDate';
import { LanguagePairsDict } from 'interfaces/languagePair';
import { MeetingDate, MeetingDateResponse } from 'interfaces/meetingDate';

export interface ClerkState {
  translators: Array<ClerkTranslator>;
  langs: LanguagePairsDict;
  meetingDates: Array<MeetingDate>;
  examinationDates: Array<ExaminationDate>;
}

export interface ClerkStateResponse {
  translators: Array<ClerkTranslatorResponse>;
  langs: LanguagePairsDict;
  towns: Array<string>;
  meetingDates: Array<MeetingDateResponse>;
  examinationDates: Array<ExaminationDateResponse>;
}
