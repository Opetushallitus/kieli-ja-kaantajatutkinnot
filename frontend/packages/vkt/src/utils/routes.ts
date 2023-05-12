import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export class RouteUtils {
  static stepToRoute(step: PublicEnrollmentFormStep, examEventId: number) {
    switch (step) {
      case PublicEnrollmentFormStep.Authenticate:
        return RouteUtils.replaceParameters(AppRoutes.PublicAuth, examEventId);

      case PublicEnrollmentFormStep.FillContactDetails:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentContactDetails,
          examEventId
        );

      case PublicEnrollmentFormStep.SelectExam:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentSelectExam,
          examEventId
        );

      case PublicEnrollmentFormStep.Preview:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentPreview,
          examEventId
        );

      case PublicEnrollmentFormStep.Done:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentDone,
          examEventId
        );

      case PublicEnrollmentFormStep.PaymentSuccess:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentSuccess,
          examEventId
        );

      case PublicEnrollmentFormStep.PaymentFail:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentFail,
          examEventId
        );
    }
  }

  static replaceParameters(route: string, examEventId: number) {
    return route.replace(':examEventId', examEventId.toString());
  }
}
