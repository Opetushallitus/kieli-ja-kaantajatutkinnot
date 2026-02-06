import { Dayjs } from 'dayjs';

export interface ExamDate {
  id: number;
  examDate: Dayjs;
}

export interface ExamDateResponse {
  id: number;
  examDate: string;
}
