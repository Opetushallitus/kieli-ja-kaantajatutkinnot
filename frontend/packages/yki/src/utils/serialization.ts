import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import { ExamSessions, ExamSessionsResponse } from 'interfaces/examSessions';

export class SerializationUtils {
  static deserializeExamSessionsResponse(
    examSessionsResponse: ExamSessionsResponse
  ): ExamSessions {
    const exam_sessions = examSessionsResponse.exam_sessions.map((es) => ({
      ...es,
      session_date: dayjs(es.session_date),
      post_admission_start_date: DateUtils.optionalStringToDate(
        es.post_admission_start_date
      ),
      post_admission_end_date: DateUtils.optionalStringToDate(
        es.post_admission_end_date
      ),
      registration_start_date: DateUtils.optionalStringToDate(
        es.registration_start_date
      ),
      registration_end_date: DateUtils.optionalStringToDate(
        es.registration_end_date
      ),
      exam_fee: parseInt(es.exam_fee as string),
    }));

    return { exam_sessions };
  }
}
