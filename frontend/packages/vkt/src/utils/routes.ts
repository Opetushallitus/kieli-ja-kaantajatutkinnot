import { AppLanguage } from 'shared/enums';

import { getCurrentLang } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export class RouteUtils {
  static getAuthLoginApiRoute(examEventId: number, type: string) {
    return APIEndpoints.PublicAuthLogin.replace(
      ':examEventId',
      `${examEventId}`
    )
      .replace(':type', type)
      .replace(':locale', RouteUtils.getApiRouteLocale());
  }

  static getPaymentCreateApiRoute(enrollmentId?: number) {
    return APIEndpoints.PaymentCreate.replace(
      ':enrollmentId',
      `${enrollmentId}`
    ).replace(':locale', RouteUtils.getApiRouteLocale());
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
          examEventId
        );

      case PublicEnrollmentFormStep.SelectExam:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentSelectExam,
          examEventId
        );

      case PublicEnrollmentFormStep.Preview:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentPreview,
          examEventId
        );

      case PublicEnrollmentFormStep.Payment:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentPaymentFail,
          examEventId
        );

      case PublicEnrollmentFormStep.PaymentSuccess:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentPaymentSuccess,
          examEventId
        );

      case PublicEnrollmentFormStep.Done:
        return RouteUtils.replaceExamEventId(
          AppRoutes.PublicEnrollmentDone,
          examEventId
        );
    }
  }

  static replaceExamEventId(route: string, examEventId: number) {
    return route.replace(':examEventId', examEventId.toString());
  }
}
