import { AppLanguage } from 'shared/enums';

import { getCurrentLang } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import {
  PublicEnrollmentAppointmentFormStep,
  PublicEnrollmentContactFormStep,
  PublicEnrollmentFormStep,
} from 'enums/publicEnrollment';

export class RouteUtils {
  static getAuthLoginApiRoute(targetId: number, type: string) {
    return APIEndpoints.PublicAuthLogin.replace(':targetId', `${targetId}`)
      .replace(':type', type)
      .replace(':locale', RouteUtils.getApiRouteLocale());
  }

  // FIXME add type definition
  static getPaymentCreateApiRoute(type: string, enrollmentId?: number) {
    return APIEndpoints.PaymentCreate.replace(
      ':enrollmentId',
      `${enrollmentId}`,
    )
      .replace(':locale', RouteUtils.getApiRouteLocale())
      .replace(':type', type);
  }

  private static getApiRouteLocale() {
    switch (getCurrentLang()) {
      case AppLanguage.Swedish:
        return 'sv';
      default:
        return 'fi';
    }
  }

  static stepToRoute(step: PublicEnrollmentFormStep, examEventId: number) {
    switch (step) {
      case PublicEnrollmentFormStep.Authenticate:
        return RouteUtils.replaceExamEventId(AppRoutes.PublicAuth, examEventId);

      case PublicEnrollmentFormStep.FillContactDetails:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentContactDetails,
          examEventId,
        );

      case PublicEnrollmentFormStep.EducationDetails:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentEducationDetails,
          examEventId,
        );

      case PublicEnrollmentFormStep.SelectExam:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentSelectExam,
          examEventId,
        );

      case PublicEnrollmentFormStep.Preview:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentPreview,
          examEventId,
        );

      case PublicEnrollmentFormStep.Payment:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentPaymentFail,
          examEventId,
        );

      case PublicEnrollmentFormStep.PaymentSuccess:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentPaymentSuccess,
          examEventId,
        );

      case PublicEnrollmentFormStep.DoneQueued:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentDoneQueued,
          examEventId,
        );

      case PublicEnrollmentFormStep.Done:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentDone,
          examEventId,
        );
    }
  }

  static replaceExamEventId(route: string, examEventId: number) {
    return route.replace(':examEventId', examEventId.toString());
  }

  static appointmentStepToRoute(
    step: PublicEnrollmentAppointmentFormStep,
    enrollmentId?: number,
  ) {
    if (!enrollmentId) {
      return '';
    }

    switch (step) {
      case PublicEnrollmentAppointmentFormStep.Authenticate:
        return RouteUtils.replaceEnrollmentId(
          AppRoutes.PublicAuthAppointment,
          enrollmentId,
        );

      case PublicEnrollmentAppointmentFormStep.FillContactDetails:
        return RouteUtils.replaceEnrollmentId(
          AppRoutes.PublicEnrollmentAppointmentContactDetails,
          enrollmentId,
        );

      case PublicEnrollmentAppointmentFormStep.Preview:
        return RouteUtils.replaceEnrollmentId(
          AppRoutes.PublicEnrollmentAppointmentPreview,
          enrollmentId,
        );

      case PublicEnrollmentAppointmentFormStep.PaymentFail:
        return RouteUtils.replaceEnrollmentId(
          AppRoutes.PublicEnrollmentPaymentFail,
          enrollmentId,
        );

      case PublicEnrollmentAppointmentFormStep.PaymentSuccess:
        return RouteUtils.replaceEnrollmentId(
          AppRoutes.PublicEnrollmentPaymentSuccess,
          enrollmentId,
        );
    }
  }

  static replaceEnrollmentId(route: string, enrollmentId: number) {
    return route.replace(':enrollmentId', enrollmentId.toString());
  }

  static replaceExaminerId(route: string, examinerId: number) {
    return route.replace(':examinerId', examinerId.toString());
  }

  static contactStepToRoute(
    step: PublicEnrollmentContactFormStep,
    examinerId: number,
  ) {
    switch (step) {
      case PublicEnrollmentContactFormStep.FillContactDetails:
        return RouteUtils.replaceExaminerId(
          AppRoutes.PublicEnrollmentContactContactDetails,
          examinerId,
        );

      case PublicEnrollmentContactFormStep.SelectExam:
        return RouteUtils.replaceExaminerId(
          AppRoutes.PublicEnrollmentContactSelectExam,
          examinerId,
        );

      case PublicEnrollmentContactFormStep.Done:
        return RouteUtils.replaceExaminerId(
          AppRoutes.PublicEnrollmentContactDone,
          examinerId,
        );
    }
  }
}
