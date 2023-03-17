import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import {
  EvaluationPeriod,
  EvaluationPeriodResponse,
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

  static deserializeEvaluationPeriodResponse(
    evaluationPeriodResponse: EvaluationPeriodResponse
  ): EvaluationPeriod {
    return {
      ...evaluationPeriodResponse,
      exam_date: dayjs(evaluationPeriodResponse.exam_date),
      evaluation_start_date: dayjs(
        evaluationPeriodResponse.evaluation_start_date
      ),
      evaluation_end_date: dayjs(evaluationPeriodResponse.evaluation_end_date),
    };
  }

  static deserializeEvaluationPeriodsResponse(
    evaluationPeriodsResponse: EvaluationPeriodsResponse
  ): EvaluationPeriods {
    const evaluation_periods = evaluationPeriodsResponse.evaluation_periods.map(
      SerializationUtils.deserializeEvaluationPeriodResponse
    );

    return { evaluation_periods };
  }
}
