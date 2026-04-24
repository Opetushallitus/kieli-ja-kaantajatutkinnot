import dayjs, { Dayjs } from 'dayjs';
import { AppLanguage } from 'shared/enums';

import { GenderEnum, RegistrationKind, RegistrationStates } from 'enums/app';
import {
  AdmissionedRegistration,
  ClerkCustomerDetails,
  ClerkCustomerDetailsResponse,
  ClerkCustomerSummary,
  ClerkCustomerSummaryResponse,
  ExamLocation,
  ExamState,
  PastRegistration,
  QueuedRegistration,
  QueueOfferStatus,
  QueueSpotOffered,
  RegistrationResponse,
} from 'interfaces/clerkCustomer';
import {
  ClerkExamSession,
  ClerkExamSessionResponse,
} from 'interfaces/clerkExamSession';
import {
  ClerkFreeRegistrationDetailsResponse,
  ClerkFreeRegistrationResponse,
} from 'interfaces/clerkFreeRegistration';
import {
  ClerkOrganizer,
  ClerkOrganizerResponse,
} from 'interfaces/clerkOrganizer';
import { FindByOidsOrganizationResponse } from 'interfaces/clerkOrganizerRegistry';
import {
  ClerkQuarantineMatch,
  ClerkQuarantineMatchResponse,
  ClerkQuarantineReview,
  ClerkQuarantineReviewResponse,
} from 'interfaces/clerkQuarantine';
import { ClerkRegistrationResponse } from 'interfaces/clerkRegistration';
import {
  ExamSession,
  ExamSessionResponse,
  ExamSessions,
  ExamSessionsResponse,
} from 'interfaces/examSessions';
import { NationalitiesResponse, Nationality } from 'interfaces/nationality';

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

  static deserializeClerkRegistrationResponse(
    registrationResponse: ClerkRegistrationResponse,
  ) {
    return {
      ...registrationResponse,
      registrationDate: dayjs(registrationResponse.registrationDate),
    };
  }

  static serializeClerkOrganizer(organizer: Partial<ClerkOrganizer>) {
    return {
      ...organizer,
      agreement_start_date: organizer.agreement_start_date
        ? organizer.agreement_start_date.format('YYYY-MM-DD')
        : undefined,
      agreement_end_date: organizer.agreement_end_date
        ? organizer.agreement_end_date.format('YYYY-MM-DD')
        : undefined,
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

  static deserializeClerkExamSessionResponse(
    clerkExamSessionResponse: ClerkExamSessionResponse,
  ): ClerkExamSession {
    return {
      ...clerkExamSessionResponse,
      publishedAt: dayjs(clerkExamSessionResponse.publishedAt),
      date: dayjs(clerkExamSessionResponse.date),
      registrationStartDate: dayjs(
        clerkExamSessionResponse.registrationStartDate,
      ),
      registrationEndDate: dayjs(
        clerkExamSessionResponse.registrationStartDate,
      ),
      availableRegistrationKind:
        clerkExamSessionResponse.availableRegistrationKind === 'ADMISSION'
          ? RegistrationKind.Admission
          : RegistrationKind.Queue,
      registrations: clerkExamSessionResponse.registrations.map(
        SerializationUtils.deserializeClerkRegistrationResponse,
      ),
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

    // TODO: Registrations lifted from queue have kind=Admission instead of kind=Queue.
    // This makes it difficult to identify them for display in the "Queue" grouping (per designs).
    // The data model needs clarification: should lifted registrations retain Queue kind with an additional
    // status field, or should we add a separate field to track their queue history?
    const admissionedRegistrations = notPastRegistrations.filter(
      (registration) => registration.kind !== RegistrationKind.Queue,
    );
    const queuedRegistrations = notPastRegistrations.filter(
      (registration) => registration.kind === RegistrationKind.Queue,
    );

    return {
      ...clerkCustomerDetailsResponse,
      admissionedRegistrations: admissionedRegistrations.map(
        SerializationUtils.deserializeAdmissionedRegistration,
      ),
      queueRegistrations: queuedRegistrations.map(
        SerializationUtils.deserializeQueuedRegistration,
      ),
      pastRegistrations: pastRegistrations.map(
        SerializationUtils.deserializePastRegistration,
      ),
    };
  }

  static deserializeClerkCustomerSummaryResponse(
    clerkCustomerSummaryResponse: ClerkCustomerSummaryResponse,
  ): ClerkCustomerSummary {
    return {
      ...clerkCustomerSummaryResponse,
      person: {
        ...clerkCustomerSummaryResponse.person,
        ssn: clerkCustomerSummaryResponse.person.ssn ?? undefined,
        phoneNumber:
          clerkCustomerSummaryResponse.person.phoneNumber ?? undefined,
        email: clerkCustomerSummaryResponse.person.email ?? undefined,
        streetAddress:
          clerkCustomerSummaryResponse.person.streetAddress ?? undefined,
        zip: clerkCustomerSummaryResponse.person.zip ?? undefined,
        postOffice: clerkCustomerSummaryResponse.person.postOffice ?? undefined,
      },
    };
  }

  static deserializeAdmissionedRegistration(
    registration: RegistrationResponse,
  ): AdmissionedRegistration {
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

  static deserializeQueuedRegistration(
    registration: RegistrationResponse,
  ): QueuedRegistration {
    const state = SerializationUtils.deserializeRegistrationState(
      registration.registrationState,
    );

    return {
      ...registration,
      registrationStatus: {
        state,
        paidAt: registration.examPaymentPaidAt
          ? dayjs(registration.examPaymentPaidAt)
          : undefined,
      },
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

  static deserializePastRegistration(
    registration: RegistrationResponse,
  ): PastRegistration {
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

  static deserializeClerkQuarantineMatchResponse(
    response: ClerkQuarantineMatchResponse,
  ): ClerkQuarantineMatch {
    return {
      quarantineId: response.id,
      registrationId: response.registrationId,
      examLanguageCode: response.languageCode,
      examLevelCode: response.levelCode,
      examDate: dayjs(response.examDate),
      state: SerializationUtils.deserializeRegistrationState(response.state),
      quarantinedPerson: response.quarantinedPerson,
      registrant: response.registrant,
    };
  }

  static deserializeClerkQuarantineReviewResponse(
    response: ClerkQuarantineReviewResponse,
  ): ClerkQuarantineReview {
    return {
      id: response.id,
      quarantined: response.quarantined,
      quarantineId: response.quarantineId,
      registrationId: response.registrationId,
      updated: dayjs(response.updated),
      examDate: dayjs(response.examDate),
      examLanguageCode:
        response.languageCode.trim() as ClerkQuarantineReview['examLanguageCode'],
      examLevelCode:
        response.levelCode.trim() as ClerkQuarantineReview['examLevelCode'],
      state: response.state as ClerkQuarantineReview['state'],
      quarantinedPerson: response.quarantinedPerson,
      registrant: response.registrant,
    };
  }

  static deserializeFindByOidsOrganizationResponse(
    organizationResponse: FindByOidsOrganizationResponse,
  ) {
    return {
      ...organizationResponse,
      alkuPvm: dayjs(organizationResponse.alkuPvm),
      nimet: organizationResponse.nimet.map((nimiHistoria) => ({
        ...nimiHistoria,
        alkuPvm: dayjs(nimiHistoria.alkuPvm),
      })),
      tarkastusPvm: organizationResponse.tarkastusPvm
        ? dayjs(organizationResponse.tarkastusPvm)
        : undefined,
      ytjpaivitysPvm: organizationResponse.ytjpaivitysPvm
        ? dayjs(organizationResponse.ytjpaivitysPvm)
        : undefined,
    };
  }
}
