import { Dayjs } from "dayjs";
import { WithId } from "shared/interfaces";

import { ExamLanguage } from "enums/app";

export interface PublicExaminer extends WithId {
  name: string;
  language: ExamLanguage;
  municipality: Array<string>;
  examDates: Array<Dayjs>;
}