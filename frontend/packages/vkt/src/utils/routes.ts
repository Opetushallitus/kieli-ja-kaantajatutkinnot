import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';

export class RouteUtils {
  static stepToRoute(
    step: PublicEnrollmentFormStep,
    examEventId: number,
    reservationId: number
  ) {
    switch (step) {
      case PublicEnrollmentFormStep.Authenticate:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicAuth,
          examEventId,
          reservationId
        );

      case PublicEnrollmentFormStep.FillContactDetails:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentContactDetails,
          examEventId,
          reservationId
        );

      case PublicEnrollmentFormStep.SelectExam:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentSelectExam,
          examEventId,
          reservationId
        );

      case PublicEnrollmentFormStep.Preview:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentPreview,
          examEventId,
          reservationId
        );

      case PublicEnrollmentFormStep.Done:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentDone,
          examEventId,
          reservationId
        );

      case PublicEnrollmentFormStep.PaymentSuccess:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentSuccess,
          examEventId,
          reservationId
        );

      case PublicEnrollmentFormStep.PaymentFail:
        return RouteUtils.replaceParameters(
          AppRoutes.PublicEnrollmentFail,
          examEventId,
          reservationId
        );
    }
  }

  static replaceParameters(
    route: string,
    examEventId: number,
    reservationId: number
  ) {
    return route
      .replace(':examEventId', examEventId)
      .replace(':reservationId', reservationId);
  }
}
