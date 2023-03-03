import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import {
  ExamSession,
  ExamSessionResponse,
  ExamSessions,
  ExamSessionsResponse,
} from 'interfaces/examSessions';

export class SerializationUtils {
  static deserializeExamSessionResponse(
    examSessionResponse: ExamSessionResponse
  ): ExamSession {
    return {
      ...examSessionResponse,
      session_date: dayjs(examSessionResponse.session_date),
      post_admission_start_date: DateUtils.optionalStringToDate(
        examSessionResponse.post_admission_start_date
      ),
      post_admission_end_date: DateUtils.optionalStringToDate(
        examSessionResponse.post_admission_end_date
      ),
      registration_start_date: DateUtils.optionalStringToDate(
        examSessionResponse.registration_start_date
      ),
      registration_end_date: DateUtils.optionalStringToDate(
        examSessionResponse.registration_end_date
      ),
      exam_fee: parseInt(examSessionResponse.exam_fee as string),
    };
  }

  static deserializeExamSessionsResponse(
    examSessionsResponse: ExamSessionsResponse
  ): ExamSessions {
    const exam_sessions = examSessionsResponse.exam_sessions.map(
      SerializationUtils.deserializeExamSessionResponse
    );

    return { exam_sessions };
  }
}
