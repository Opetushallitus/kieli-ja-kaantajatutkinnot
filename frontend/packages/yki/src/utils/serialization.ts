import dayjs, { Dayjs } from 'dayjs';
import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import {
  ExamLanguage,
  ExamLevel,
  GenderEnum,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';
import {
  ClerkCustomerDetails,
  ClerkCustomerDetailsResponse,
  Exam,
  ExamLocation,
  ExamState,
  PastExam,
  QueuedRegistration,
  QueueOfferStatus,
  QueueSpotOffered,
  RegistrationResponse,
} from 'interfaces/clerkCustomer';
import {
  ClerkFreeRegistrationDetailsResponse,
  ClerkFreeRegistrationResponse,
} from 'interfaces/clerkFreeRegistration';
import { ClerkOrganizerResponse } from 'interfaces/clerkOrganizer';
import {
  RegistrationToConfirmDetails,
  RegistrationToConfirmDetailsResponse,
} from 'interfaces/confirmRegistration';
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
import { FreeRegistrationBasis } from 'interfaces/freeRegistration';
import {
  LoginLinkDetails,
  LoginLinkDetailsResponse,
} from 'interfaces/loginLink';
import { NationalitiesResponse, Nationality } from 'interfaces/nationality';
import { KoskiEducationDTO } from 'interfaces/publicEducation';
import {
  PublicEmailRegistration,
  PublicRegistrationInitPayload,
  PublicRegistrationInitRequest,
  PublicSuomiFiRegistration,
} from 'interfaces/publicRegistration';
import {
  TransferRegistrationDetails,
  TransferRegistrationDetailsResponse,
  TransferRegistrationTarget,
  TransferRegistrationTargetResponse,
} from 'interfaces/transferRegistration';
import {
  ModifyContactDetails,
  PersonDetails,
  PersonDetailsResponse,
} from 'interfaces/userDetails';
import { EvaluationOrderState } from 'redux/reducers/evaluationOrder';

export class SerializationUtils {
  static deserializeStartTime(date?: string) {
    if (date) {
      return dayjs(date, 'YYYY-MM-DD').hour(10);
    }
  }

  static deserializeEndTime(date?: string) {
    if (date) {
      return dayjs(date, 'YYYY-MM-DD').hour(16);
    }
  }

  static deserializeExamSessionResponse(
    examSessionResponse: ExamSessionResponse,
  ): ExamSession {
    return {
      ...examSessionResponse,
      session_date: dayjs(examSessionResponse.session_date),
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

  static deserializeAppLanguage(language: string): AppLanguage {
    switch (language) {
      case 'sv':
        return AppLanguage.Swedish;
      case 'en':
        return AppLanguage.English;
      case 'fi':
      default:
        return AppLanguage.Finnish;
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
      post_office: registration.postOffice,
      street_address: registration.address,
      phone_number: registration.phoneNumber,
      email: registration.email,
      gender: SerializationUtils.serializeGender(registration.gender),
    };
  }

  static deserializeRegistrationState(state: string) {
    switch (state) {
      case 'COMPLETED':
        return RegistrationStates.Completed;
      case 'SUBMITTED':
        return RegistrationStates.Submitted;
      case 'STARTED':
        return RegistrationStates.Started;
      case 'EXPIRED':
        return RegistrationStates.Expired;
      case 'CANCELLED':
        return RegistrationStates.Cancelled;
      case 'PAID_AND_CANCELLED':
        return RegistrationStates.PaidAndCancelled;
      default:
        return RegistrationStates.Unknown;
    }
  }

  static deserializePersonDetails(
    response: PersonDetailsResponse,
  ): PersonDetails {
    return {
      firstName: response.first_name,
      lastName: response.last_name,
      email: response.email,
      phoneNumber: response.phone_number,
      streetAddress: response.street_address,
      postOffice: response.post_office,
      zip: response.zip,
      registrations: response.registrations?.map((v) => ({
        id: v.id,
        kind: v.kind as RegistrationKind,
        examSessionId: v.exam_session_id,
        examLang: v.language_code as ExamLanguage,
        examLevel: v.level_code as ExamLevel,
        state: SerializationUtils.deserializeRegistrationState(v.state),
        examDate: dayjs(v.exam_date),
        registrationStartDate: dayjs(v.registration_start_date),
        registrationEndDate: dayjs(v.registration_end_date),
        location: v.location,
        isCancellable: v.is_cancellable,
        isTransferable: v.is_transferable,
        isTransfered: v.is_transfered,
        expiresAt: v.expires_at ? dayjs(v.expires_at) : undefined,
        paidAt: v.paid_at ? dayjs(v.paid_at) : undefined,
        examFee: v.exam_fee,
        liftedFromQueueAt: v.lifted_from_queue_at
          ? dayjs(v.lifted_from_queue_at)
          : undefined,
        positionInQueue:
          v.kind === RegistrationKind.Queue
            ? (v.position_in_queue || 0) + 1
            : undefined,
        isFreeRegistration: v.is_free_registration,
      })),
    };
  }

  static deserializeTransferRegistrationTarget(
    response: TransferRegistrationTargetResponse,
  ): TransferRegistrationTarget {
    return { ...response, session_date: dayjs(response.session_date) };
  }

  static deserializeTransferRegistrationDetails(
    response: TransferRegistrationDetailsResponse,
  ): TransferRegistrationDetails {
    return {
      ...response,
      session_date: dayjs(response.session_date),
      targets: response.targets.map(
        SerializationUtils.deserializeTransferRegistrationTarget,
      ),
    };
  }

  static deserializeRegistrationToConfirmDetailsResponse(
    response: RegistrationToConfirmDetailsResponse,
  ): RegistrationToConfirmDetails {
    return {
      ...response,
      session_date: dayjs(response.session_date),
      due_date: dayjs(response.expires_at).subtract(1, 'day'),
      registration_start_date: SerializationUtils.deserializeStartTime(
        response.registration_start_date,
      ) as Dayjs,
      registration_end_date: SerializationUtils.deserializeEndTime(
        response.registration_end_date,
      ) as Dayjs,
    };
  }

  static deserializeLoginLinkDetailsResponse(
    response: LoginLinkDetailsResponse,
  ): LoginLinkDetails {
    return {
      expires_at: dayjs(response.expires_at).subtract(1, 'day'),
    };
  }

  static serializePublicRegistrationInitRequest(
    payload: PublicRegistrationInitPayload,
  ): PublicRegistrationInitRequest {
    return {
      exam_session_id: payload.examSessionId,
      to_queue: payload.registrationKind === RegistrationKind.Queue,
    };
  }

  static deserializeClerkOrganizerResponse(
    organizerResponse: ClerkOrganizerResponse,
  ) {
    return {
      ...organizerResponse,
      agreement_start_date: organizerResponse.agreement_start_date
        ? dayjs(organizerResponse.agreement_start_date)
        : undefined,
      agreement_end_date: organizerResponse.agreement_end_date
        ? dayjs(organizerResponse.agreement_end_date)
        : undefined,
      languages: organizerResponse.languages || null,
      extra: organizerResponse.extra || '',
    };
  }

  static deserializeClerkFreeRegistrationResponse(
    freeRegistrationResponse: ClerkFreeRegistrationResponse,
  ) {
    return {
      ...freeRegistrationResponse,
      supplementRequestDueDate:
        freeRegistrationResponse.supplementRequestDueDate
          ? dayjs(freeRegistrationResponse.supplementRequestDueDate)
          : undefined,
      assessmentDate: freeRegistrationResponse.assessmentDate
        ? dayjs(freeRegistrationResponse.assessmentDate)
        : undefined,
      examDate: dayjs(freeRegistrationResponse.examDate),
    };
  }

  static deserializeClerkFreeRegistrationDetailsResponse(
    freeRegistrationDetailsResponse: ClerkFreeRegistrationDetailsResponse,
  ) {
    return {
      ...freeRegistrationDetailsResponse,
      languageOfService:
        freeRegistrationDetailsResponse.languageOfService.toLowerCase() as
          | 'fi'
          | 'sv'
          | 'en',
      supplementRequestDueDate:
        freeRegistrationDetailsResponse.supplementRequestDueDate
          ? dayjs(freeRegistrationDetailsResponse.supplementRequestDueDate)
          : undefined,
      supplementRequest: freeRegistrationDetailsResponse.supplementRequest
        ? {
            ...freeRegistrationDetailsResponse.supplementRequest,
            createdAt: dayjs(
              freeRegistrationDetailsResponse.supplementRequest.createdAt,
            ),
          }
        : undefined,
      assessmentDate: freeRegistrationDetailsResponse.assessmentDate
        ? dayjs(freeRegistrationDetailsResponse.assessmentDate)
        : undefined,
      examSession: {
        ...freeRegistrationDetailsResponse.examSession,
        examDate: dayjs(freeRegistrationDetailsResponse.examSession.examDate),
      },
      attachments: freeRegistrationDetailsResponse.attachments.map(
        (attachment) => ({
          ...attachment,
          submittedAt: dayjs(attachment.submittedAt),
        }),
      ),
      messages: freeRegistrationDetailsResponse.messages.map((message) => ({
        ...message,
        createdAt: dayjs(message.createdAt),
      })),
    };
  }
  static serializeModifyContactDetailsRequest(payload: ModifyContactDetails) {
    const { email, phoneNumber, streetAddress, zip, postOffice } = payload;

    return {
      email,
      phone_number: phoneNumber,
      street_address: streetAddress,
      zip,
      post_office: postOffice,
    };
  }
  static deserializeClerkCustomerDetailsResponse(
    clerkCustomerDetailsResponse: ClerkCustomerDetailsResponse,
  ): ClerkCustomerDetails {
    const now = dayjs().startOf('day');
    const pastRegistrations = clerkCustomerDetailsResponse.registrations.filter(
      (registration) => dayjs(registration.examDate).isBefore(now),
    );
    const notPastRegistrations =
      clerkCustomerDetailsResponse.registrations.filter(
        (registration) => !dayjs(registration.examDate).isBefore(now),
      );

    const registeredRegistrations = notPastRegistrations.filter(
      (registration) => registration.kind === RegistrationKind.Admission,
    );
    const queuedRegistrations = notPastRegistrations.filter(
      (registration) => registration.kind === RegistrationKind.Queue,
    );

    return {
      ...clerkCustomerDetailsResponse,
      registrations: registeredRegistrations.map(
        SerializationUtils.deserializeUpcomingRegistration,
      ),
      queuedExams: queuedRegistrations.map(
        SerializationUtils.deserializeQueuedExam,
      ),
      pastExams: pastRegistrations.map(SerializationUtils.deserializePastExam),
    };
  }

  static deserializeUpcomingRegistration(
    registration: RegistrationResponse,
  ): Exam {
    return {
      ...registration,
      registrationStatus: {
        state: SerializationUtils.deserializeRegistrationState(
          registration.registrationState,
        ),
        paidAt: registration.examPaymentPaidAt
          ? dayjs(registration.examPaymentPaidAt)
          : undefined,
      },
      registrationDate: registration.registrationDate
        ? dayjs(registration.registrationDate)
        : undefined,
      examDate: dayjs(registration.examDate),
      examLocation: SerializationUtils.deserializaMapLocation(
        registration.examLocation,
      ),
    };
  }

  static deserializeQueuedExam(
    registration: RegistrationResponse,
  ): QueuedRegistration {
    const state = SerializationUtils.deserializeRegistrationState(
      registration.registrationState,
    );
    const registrationStatus = {
      state,
      paidAt: registration.examPaymentPaidAt
        ? dayjs(registration.examPaymentPaidAt)
        : undefined,
    };

    return {
      ...registration,
      registrationStatus,
      queueSpotOffered: SerializationUtils.getQueueSpotOffered(
        state,
        registration.liftedFromQueueAt,
        registration.expiresAt,
      ),
      registrationDate: registration.registrationDate
        ? dayjs(registration.registrationDate)
        : undefined,
      examDate: dayjs(registration.examDate),
      examLocation: SerializationUtils.deserializaMapLocation(
        registration.examLocation,
      ),
    };
  }

  static getQueueSpotOffered(
    state: RegistrationStates,
    liftedFromQueueAt?: string,
    expiresAt?: string,
  ): QueueSpotOffered {
    const queueSpotOffered: QueueSpotOffered = {
      offered: QueueOfferStatus.NotOffered,
      expiresAt: expiresAt ? dayjs(expiresAt) : undefined,
    };

    if (liftedFromQueueAt) {
      // Customer got a spot offer
      // (status maybe be overriden by certain statuses)
      queueSpotOffered.offered = QueueOfferStatus.Offered;
    }

    if (
      liftedFromQueueAt &&
      (state === RegistrationStates.Completed ||
        state === RegistrationStates.PaidAndCancelled)
    ) {
      // Customer has received a queue spot
      queueSpotOffered.offered = QueueOfferStatus.Offered;
    } else if (
      liftedFromQueueAt &&
      (state === RegistrationStates.Submitted ||
        state === RegistrationStates.Cancelled ||
        state === RegistrationStates.Expired)
    ) {
      // Customer did not accept the queue offer
      queueSpotOffered.offered = QueueOfferStatus.NotAccepted;
    }

    return queueSpotOffered;
  }

  static deserializePastExam(registration: RegistrationResponse): PastExam {
    const registrationState = SerializationUtils.deserializeRegistrationState(
      registration.registrationState,
    );
    const state: ExamState =
      registrationState === RegistrationStates.Cancelled
        ? 'CANCELLED'
        : 'REGISTERED';

    return {
      exam: registration.exam,
      examDate: dayjs(registration.examDate),
      examLocation: SerializationUtils.deserializaMapLocation(
        registration.examLocation,
      ),
      state,
    };
  }

  static deserializaMapLocation(
    examLocation: {
      name: string;
      municipality: string;
      lang: string;
    }[],
  ): ExamLocation[] {
    return examLocation.map((l) => ({
      ...l,
      lang: SerializationUtils.deserializeAppLanguage(l.lang),
    }));
  }

  static mapKoskiEducationToFreeRegistrationBasis(
    koskiEducation: KoskiEducationDTO,
  ): FreeRegistrationBasis {
    switch (koskiEducation.educationType) {
      case 'ylioppilastutkinto':
        return 'MatriculationExam';
      case 'dia':
      case 'eb':
        return 'ComparableMatriculation';
      case 'korkeakoulutus':
        return koskiEducation.isActive
          ? 'HigherEducationEnrolled'
          : 'HigherEducationConcluded';
    }
  }
}
