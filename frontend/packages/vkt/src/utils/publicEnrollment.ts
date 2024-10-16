import {
  PublicEnrollmentAppointmentFormStep,
  PublicEnrollmentContactFormStep,
  PublicEnrollmentFormStep,
} from 'enums/publicEnrollment';
import { PublicFreeEnrollmentDetails } from 'interfaces/publicEducation';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { EnrollmentUtils } from 'utils/enrollment';

export const ENROLLMENT_SKILL_PRICE = 257;

export class PublicEnrollmentUtils {
  static getEnrollmentSteps(includePaymentStep: boolean) {
    const commonSteps = [
      PublicEnrollmentFormStep.Authenticate,
      PublicEnrollmentFormStep.FillContactDetails,
      PublicEnrollmentFormStep.EducationDetails,
      PublicEnrollmentFormStep.SelectExam,
      PublicEnrollmentFormStep.Preview,
    ];

    return includePaymentStep
      ? [
          ...commonSteps,
          PublicEnrollmentFormStep.Payment,
          PublicEnrollmentFormStep.PaymentSuccess,
        ]
      : [...commonSteps, PublicEnrollmentFormStep.Done];
  }

  static getEnrollmentAppointmentSteps() {
    return [
      PublicEnrollmentAppointmentFormStep.Authenticate,
      PublicEnrollmentAppointmentFormStep.FillContactDetails,
      PublicEnrollmentAppointmentFormStep.Preview,
      PublicEnrollmentAppointmentFormStep.PaymentFail,
      PublicEnrollmentAppointmentFormStep.PaymentSuccess,
    ];
  }

  static getEnrollmentContactSteps() {
    return [
      PublicEnrollmentContactFormStep.FillContactDetails,
      PublicEnrollmentContactFormStep.SelectExam,
      PublicEnrollmentContactFormStep.Done,
    ];
  }

  static getEnrollmentNextStep(
    activeStep: PublicEnrollmentFormStep,
    includePaymentStep: boolean,
  ) {
    const steps = PublicEnrollmentUtils.getEnrollmentSteps(includePaymentStep);
    const currentIndex = steps.findIndex((step) => step === activeStep);

    return steps[currentIndex + 1];
  }

  static calculateAppointmentPaymentSum() {
    return ENROLLMENT_SKILL_PRICE;
  }

  static calculateExaminationPaymentSum(
    enrollment: PublicEnrollment,
    freeEnrollmentDetails?: PublicFreeEnrollmentDetails,
  ) {
    let selectedNonFreeSkillsCount = 0;

    if (EnrollmentUtils.hasFreeBasis(enrollment) && freeEnrollmentDetails) {
      if (
        enrollment.oralSkill &&
        freeEnrollmentDetails.freeOralSkillLeft <= 0
      ) {
        selectedNonFreeSkillsCount++;
      }

      if (
        enrollment.textualSkill &&
        freeEnrollmentDetails.freeTextualSkillLeft <= 0
      ) {
        selectedNonFreeSkillsCount++;
      }
    } else {
      selectedNonFreeSkillsCount = [
        enrollment.oralSkill,
        enrollment.textualSkill,
        enrollment.understandingSkill,
      ].filter((s) => s).length;
    }

    return ENROLLMENT_SKILL_PRICE * Math.min(selectedNonFreeSkillsCount, 2);
  }
}
