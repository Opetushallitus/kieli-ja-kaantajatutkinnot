import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import {
  EvaluationPeriods,
  EvaluationPeriodsResponse,
} from 'interfaces/evaluationPeriod';
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

  static deserializeEvaluationPeriodsResponse(
    evaluationPeriodsResponse: EvaluationPeriodsResponse
  ): EvaluationPeriods {
    const evaluation_periods = evaluationPeriodsResponse.evaluation_periods.map(
      (ep) => ({
        ...ep,
        exam_date: dayjs(ep.exam_date),
        evaluation_start_date: dayjs(ep.evaluation_start_date),
        evaluation_end_date: dayjs(ep.evaluation_end_date),
      })
    );

    return { evaluation_periods };
  }
}
