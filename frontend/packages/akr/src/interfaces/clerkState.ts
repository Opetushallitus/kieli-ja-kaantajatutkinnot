import { ClerkTranslatorResponse } from 'interfaces/clerkTranslator';
import { ExaminationDateResponse } from 'interfaces/examinationDate';
import { LanguagePairsDict } from 'interfaces/languagePair';
import { MeetingDateResponse } from 'interfaces/meetingDate';

export interface ClerkStateResponse {
  translators: Array<ClerkTranslatorResponse>;
  langs: LanguagePairsDict;
  meetingDates: Array<MeetingDateResponse>;
  examinationDates: Array<ExaminationDateResponse>;
}
