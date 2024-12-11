import dayjs from 'dayjs';
import { DateUtils } from 'shared/utils';

import { ExamLanguage } from 'enums/app';
import {
  ClerkAuthLink,
  ClerkAuthLinkResponse,
  ClerkEnrollment,
  ClerkEnrollmentAppointment,
  ClerkEnrollmentAppointmentHistory,
  ClerkEnrollmentAppointmentHistoryResponse,
  ClerkEnrollmentAppointmentResponse,
  ClerkEnrollmentContactResponse,
  ClerkEnrollmentResponse,
  ClerkPaymentLinkResponse,
  ClerkPaymentResponse,
} from 'interfaces/clerkEnrollment';
import {
  ClerkExamEvent,
  ClerkExamEventResponse,
} from 'interfaces/clerkExamEvent';
import {
  ClerkListExamEvent,
  ClerkListExamEventResponse,
} from 'interfaces/clerkListExamEvent';
import {
  ExaminerDetails,
  ExaminerDetailsResponse,
} from 'interfaces/examinerDetails';
import {
  ExaminerExamEvent,
  ExaminerExamEventResponse,
  ExaminerExamEventUpsert,
} from 'interfaces/examinerExamEvent';
import {
  Education,
  EducationType,
  PublicEducationResponse,
} from 'interfaces/publicEducation';
import {
  PublicEnrollment,
  PublicEnrollmentAppointment,
  PublicEnrollmentAppointmentResponse,
  PublicEnrollmentResponse,
  PublicReservation,
  PublicReservationResponse,
} from 'interfaces/publicEnrollment';
import {
  PublicExamEvent,
  PublicExamEventResponse,
} from 'interfaces/publicExamEvent';
import {
  PublicExaminer,
  PublicExaminerResponse,
} from 'interfaces/publicExaminer';
import {
  PublicExaminerExamEvent,
  PublicExaminerExamEventResponse,
} from 'interfaces/publicExaminerExamEvent';

export class SerializationUtils {
  static deserializePublicExamEvent(
    publicExamEvent: PublicExamEventResponse,
  ): PublicExamEvent {
    return {
      ...publicExamEvent,
      date: dayjs(publicExamEvent.date),
      registrationCloses: dayjs(publicExamEvent.registrationCloses),
      registrationOpens: dayjs(publicExamEvent.registrationOpens),
    };
  }

  static deserializePublicExaminerExamEvent(
    publicExamEvent: PublicExaminerExamEventResponse,
  ): PublicExaminerExamEvent {
    return {
      ...publicExamEvent,
      date: dayjs(publicExamEvent.date),
      registrationCloses: dayjs(publicExamEvent.registrationCloses),
    };
  }

  static deserializePublicEnrollmentAppointment(
    enrollment: PublicEnrollmentAppointmentResponse,
  ): PublicEnrollmentAppointment {
    return {
      ...enrollment,
      emailConfirmation: '',
      privacyStatementConfirmation: false,
      examEvent: SerializationUtils.deserializePublicExaminerExamEvent(
        enrollment.examEvent,
      ),
    };
  }

  static deserializePublicEnrollment(
    enrollment: PublicEnrollmentResponse,
  ): PublicEnrollment {
    return {
      ...enrollment,
      emailConfirmation: '',
      hasPreviousEnrollment: !!enrollment.previousEnrollment,
      privacyStatementConfirmation: false,
    };
  }

  static deserializePublicReservation(
    reservation: PublicReservationResponse,
  ): PublicReservation {
    return {
      ...reservation,
      expiresAt: dayjs(reservation.expiresAt),
      renewedAt: DateUtils.optionalStringToDate(reservation.renewedAt),
      createdAt: dayjs(reservation.createdAt),
    };
  }

  static deserializeClerkListExamEvent(
    listExamEvent: ClerkListExamEventResponse,
  ): ClerkListExamEvent {
    return {
      ...listExamEvent,
      date: dayjs(listExamEvent.date),
      registrationCloses: dayjs(listExamEvent.registrationCloses),
      registrationOpens: dayjs(listExamEvent.registrationOpens),
    };
  }

  static deserializeExaminerEnrollmentAuthLink(
    authLink: ClerkAuthLinkResponse,
  ): ClerkAuthLink {
    return {
      ...authLink,
      expiresAt: authLink.expiresAt && dayjs(authLink.expiresAt),
      sentAt: authLink.sentAt && dayjs(authLink.sentAt),
    };
  }

  static deserializeClerkPaymentLink(paymentLink: ClerkPaymentLinkResponse) {
    return {
      ...paymentLink,
      expiresAt: dayjs(paymentLink.expiresAt),
    };
  }

  static serializeClerkEnrollmentAppointment(
    enrollment: ClerkEnrollmentAppointment,
  ) {
    return {
      ...enrollment,
      enrollmentTime: DateUtils.serializeDate(enrollment.enrollmentTime),
      examEvent: enrollment.examEvent && enrollment.examEvent.id,
    };
  }

  static deserializeClerkEnrollmentAppointment(
    enrollment: ClerkEnrollmentAppointmentResponse,
  ) {
    return {
      ...enrollment,
      enrollmentTime: dayjs(enrollment.enrollmentTime),
      payments: enrollment.payments.map(
        SerializationUtils.deserializeClerkPayment,
      ),
      authLink:
        enrollment.authLink &&
        SerializationUtils.deserializeExaminerEnrollmentAuthLink(
          enrollment.authLink,
        ),
      examEvent:
        enrollment.examEvent &&
        SerializationUtils.deserializeExaminerExamEvent(enrollment.examEvent),
    };
  }

  static deserializeClerkEnrollmentAppointmentHistory(
    enrollment: ClerkEnrollmentAppointmentHistoryResponse,
  ): ClerkEnrollmentAppointmentHistory {
    return {
      ...enrollment,
      enrollmentTime: dayjs(enrollment.enrollmentTime),
      examEvent:
        enrollment.examEvent &&
        SerializationUtils.deserializeExaminerExamEvent(enrollment.examEvent),
    };
  }

  static deserializeClerkEnrollmentContactRequest(
    enrollment: ClerkEnrollmentContactResponse,
  ) {
    return {
      ...enrollment,
      enrollmentTime: dayjs(enrollment.enrollmentTime),
    };
  }

  static deserializeClerkEnrollment(enrollment: ClerkEnrollmentResponse) {
    return {
      ...enrollment,
      enrollmentTime: dayjs(enrollment.enrollmentTime),
      payments: enrollment.payments.map(
        SerializationUtils.deserializeClerkPayment,
      ),
    };
  }

  static deserializeClerkPayment(payment: ClerkPaymentResponse) {
    return {
      ...payment,
      createdAt: dayjs(payment.createdAt),
      refundedAt: DateUtils.optionalStringToDate(payment.refundedAt),
    };
  }

  static serializeClerkEnrollment(enrollment: ClerkEnrollment) {
    return {
      ...enrollment,
      enrollmentTime: DateUtils.serializeDate(enrollment.enrollmentTime),
    };
  }

  static deserializeClerkExamEvent(
    examEvent: ClerkExamEventResponse,
  ): ClerkExamEvent {
    return {
      ...examEvent,
      date: dayjs(examEvent.date),
      registrationCloses: dayjs(examEvent.registrationCloses),
      registrationOpens: dayjs(examEvent.registrationOpens),
      enrollments: examEvent.enrollments.map(
        SerializationUtils.deserializeClerkEnrollment,
      ),
    };
  }

  static serializeNewClerkExamEvent(examEvent: ClerkExamEvent) {
    return {
      ...examEvent,
      date: DateUtils.serializeDate(examEvent.date),
      registrationCloses: DateUtils.serializeDateTime(
        examEvent.registrationCloses,
      ),
      registrationOpens: DateUtils.serializeDateTime(
        examEvent.registrationOpens,
      ),
    };
  }

  static serializeClerkExamEvent(examEvent: ClerkExamEvent) {
    return {
      ...examEvent,
      date: DateUtils.serializeDate(examEvent.date),
      registrationCloses: DateUtils.serializeDateTime(
        examEvent.registrationCloses,
      ),
      registrationOpens: DateUtils.serializeDateTime(
        examEvent.registrationOpens,
      ),
      enrollments: examEvent.enrollments.map(
        SerializationUtils.serializeClerkEnrollment,
      ),
    };
  }

  static deserializePublicEducation(
    education: Array<PublicEducationResponse>,
  ): Array<Education> {
    const toEducationType = (education: string, isActive: boolean) => {
      switch (education) {
        case 'korkeakoulutus':
          return isActive
            ? EducationType.HigherEducationEnrolled
            : EducationType.HigherEducationConcluded;
        case 'diatutkinto':
          return EducationType.DIA;
        case 'ebtutkinto':
          return EducationType.EB;
        case 'ylioppilastutkinto':
          return EducationType.MatriculationExam;
        default:
          return EducationType.Unknown;
      }
    };

    return education.map((e) => ({
      name: toEducationType(e.educationType, e.isActive),
      ongoing: e.isActive,
    }));
  }

  static deserializePublicExaminer(
    publicExaminer: PublicExaminerResponse,
  ): PublicExaminer {
    let examinerLanguage;
    if (publicExaminer.languages.includes(ExamLanguage.SV)) {
      examinerLanguage = ExamLanguage.SV;
      if (publicExaminer.languages.includes(ExamLanguage.FI)) {
        examinerLanguage = ExamLanguage.ALL;
      }
    } else {
      examinerLanguage = ExamLanguage.FI;
    }

    return {
      id: publicExaminer.id,
      name: `${publicExaminer.firstName} ${publicExaminer.lastName}`,
      language: examinerLanguage,
      municipalities: publicExaminer.municipalities,
      examDates: publicExaminer.examDates.map(({ examDate, isFull }) => ({
        examDate: dayjs(examDate),
        isFull,
      })),
    };
  }

  static deserializeExaminerExamEvent(
    examinerExamEvent: ExaminerExamEventResponse,
  ): ExaminerExamEvent {
    const date = dayjs(examinerExamEvent.date);
    const registrationCloses = !!examinerExamEvent.registrationCloses
      ? dayjs(examinerExamEvent.registrationCloses)
      : undefined;
    const enrollments = examinerExamEvent.enrollments.map(
      SerializationUtils.deserializeClerkEnrollmentAppointment,
    );

    return { ...examinerExamEvent, date, registrationCloses, enrollments };
  }

  static deserializeExaminerExamEvents(
    examinerExamEvents: Array<ExaminerExamEventResponse>,
  ): Array<ExaminerExamEvent> {
    return examinerExamEvents.map(
      SerializationUtils.deserializeExaminerExamEvent,
    );
  }

  static serializeExaminerExamEventUpsert(
    examinerExamEvent: ExaminerExamEventUpsert,
  ) {
    return {
      ...examinerExamEvent,
      date: DateUtils.serializeDate(examinerExamEvent.date),
      registrationCloses: DateUtils.serializeDate(
        examinerExamEvent.registrationCloses,
      ),
    };
  }

  static deserializeExaminerDetails(
    examinerDetails: ExaminerDetailsResponse,
  ): ExaminerDetails {
    return {
      ...examinerDetails,
      examEvents: examinerDetails.examEvents.map(
        SerializationUtils.deserializeExaminerExamEvent,
      ),
    };
  }
}
