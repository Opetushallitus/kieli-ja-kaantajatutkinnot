import dayjs from 'dayjs';
import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import {
  EvaluationOrderRequest,
  ExaminationParts,
  Subtest,
} from 'interfaces/evaluationOrder';
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
import { EvaluationOrderState } from 'redux/reducers/evaluationOrder';

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

  static serializeEvaluationSubtests(
    examinationParts: ExaminationParts
  ): Array<Subtest> {
    const subtests: Array<Subtest> = [];
    if (examinationParts.readingComprehension) {
      subtests.push('READING');
    }
    if (examinationParts.speaking) {
      subtests.push('SPEAKING');
    }
    if (examinationParts.speechComprehension) {
      subtests.push('LISTENING');
    }
    if (examinationParts.writing) {
      subtests.push('WRITING');
    }

    return subtests;
  }

  static serializeEvaluationOrder({
    examinationParts,
    payerDetails,
  }: EvaluationOrderState): EvaluationOrderRequest {
    return {
      first_names: payerDetails.firstNames as string,
      last_name: payerDetails.lastName as string,
      birthdate: DateUtils.serializeDate(payerDetails.birthdate) as string,
      email: payerDetails.email as string,
      subtests:
        SerializationUtils.serializeEvaluationSubtests(examinationParts),
    };
  }

  static serializeAppLanguage(appLanguage: AppLanguage) {
    switch (appLanguage) {
      case AppLanguage.Finnish:
        return 'fi';
      case AppLanguage.Swedish:
        return 'sv';
      case AppLanguage.English:
        return 'en';
    }
  }
}
