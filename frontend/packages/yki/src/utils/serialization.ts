import dayjs, { Dayjs } from 'dayjs';
import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { GenderEnum } from 'enums/app';
import {
  EvaluationOrderDetails,
  EvaluationOrderDetailsResponse,
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
import { NationalitiesResponse, Nationality } from 'interfaces/nationality';
import {
  PublicEmailRegistration,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';
import { EvaluationOrderState } from 'redux/reducers/evaluationOrder';

export class SerializationUtils {
  static deserializeStartTime(date?: string) {
    if (date) {
      return dayjs(date, 'YYYY-MM-DD')
        .tz('Europe/Helsinki')
        .hour(10)
        .tz(dayjs.tz.guess());
    }
  }

  static deserializeEndTime(date?: string) {
    if (date) {
      return dayjs(date, 'YYYY-MM-DD')
        .tz('Europe/Helsinki')
        .hour(16)
        .tz(dayjs.tz.guess());
    }
  }

  static deserializeExamSessionResponse(
    examSessionResponse: ExamSessionResponse,
  ): ExamSession {
    return {
      ...examSessionResponse,
      session_date: dayjs(examSessionResponse.session_date),
      post_admission_start_date: SerializationUtils.deserializeStartTime(
        examSessionResponse.post_admission_start_date,
      ),
      post_admission_end_date: SerializationUtils.deserializeEndTime(
        examSessionResponse.post_admission_end_date,
      ),
      registration_start_date: SerializationUtils.deserializeStartTime(
        examSessionResponse.registration_start_date,
      ) as Dayjs,
      registration_end_date: SerializationUtils.deserializeEndTime(
        examSessionResponse.registration_end_date,
      ) as Dayjs,
    };
  }

  static deserializeExamSessionsResponse(
    examSessionsResponse: ExamSessionsResponse,
  ): ExamSessions {
    const exam_sessions = examSessionsResponse.exam_sessions.map(
      SerializationUtils.deserializeExamSessionResponse,
    );

    return { exam_sessions };
  }

  static deserializeEvaluationPeriodResponse(
    evaluationPeriodResponse: EvaluationPeriodResponse,
  ): EvaluationPeriod {
    return {
      ...evaluationPeriodResponse,
      exam_date: dayjs(evaluationPeriodResponse.exam_date),
      evaluation_start_date: dayjs(
        evaluationPeriodResponse.evaluation_start_date,
      ),
      evaluation_end_date: dayjs(evaluationPeriodResponse.evaluation_end_date),
    };
  }

  static deserializeEvaluationPeriodsResponse(
    evaluationPeriodsResponse: EvaluationPeriodsResponse,
  ): EvaluationPeriods {
    const evaluation_periods = evaluationPeriodsResponse.evaluation_periods.map(
      SerializationUtils.deserializeEvaluationPeriodResponse,
    );

    return { evaluation_periods };
  }

  static serializeEvaluationSubtests(
    examinationParts: ExaminationParts,
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
    participantDetails,
  }: EvaluationOrderState): EvaluationOrderRequest {
    return {
      first_names: participantDetails.firstNames as string,
      last_name: participantDetails.lastName as string,
      birthdate: DateUtils.serializeDate(
        DateUtils.parseDateString(participantDetails.birthdate),
      ) as string,
      email: participantDetails.email as string,
      subtests:
        SerializationUtils.serializeEvaluationSubtests(examinationParts),
    };
  }

  static deserializeEvaluationOrderDetailsResponse(
    response: EvaluationOrderDetailsResponse,
  ): EvaluationOrderDetails {
    return { ...response, exam_date: dayjs(response.exam_date) };
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

  static serializeGender(gender?: GenderEnum) {
    switch (gender) {
      case GenderEnum.Male:
        return '1';
      case GenderEnum.Female:
        return '2';
      default:
        return '';
    }
  }

  static deserializeNationalitiesResponse(
    response: NationalitiesResponse,
  ): Array<Nationality> {
    return response
      .map((v) =>
        v.metadata.map((metadata) => ({
          code: v.koodiArvo,
          name: metadata.nimi,
          language:
            metadata.kieli === 'EN'
              ? AppLanguage.English
              : metadata.kieli === 'SV'
              ? AppLanguage.Swedish
              : AppLanguage.Finnish,
        })),
      )
      .flat();
  }

  static serializeRegistrationForm(
    registration: Partial<PublicSuomiFiRegistration & PublicEmailRegistration>,
    nationalities: Array<Nationality>,
  ) {
    const nationality = registration.nationality;
    const nationality_desc = nationalities.find(
      (v) => v.code === nationality && v.language === AppLanguage.Finnish,
    )?.name;

    return {
      first_name: registration.firstNames,
      last_name: registration.lastName,
      nationalities: [nationality],
      nationality_desc,
      certificate_lang: registration.certificateLanguage,
      exam_lang: registration.instructionLanguage,
      birthdate: DateUtils.serializeDate(
        DateUtils.parseDateString(registration.dateOfBirth),
      ),
      ssn: registration.ssn,
      zip: registration.postNumber,
      post_office: registration.postNumber,
      street_address: registration.address,
      phone_number: registration.phoneNumber,
      email: registration.email,
      gender: SerializationUtils.serializeGender(registration.gender),
    };
  }
}
