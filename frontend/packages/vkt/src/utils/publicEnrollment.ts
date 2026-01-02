import {
  PublicEnrollmentAppointmentFormStep,
  PublicEnrollmentContactFormStep,
  PublicEnrollmentFormStep,
} from 'enums/publicEnrollment';
import { PublicFreeEnrollmentDetails } from 'interfaces/publicEducation';
import {
  PublicEnrollment,
  PublicEnrollmentAppointment,
} from 'interfaces/publicEnrollment';
import { EnrollmentUtils } from 'utils/enrollment';

export const ENROLLMENT_SKILL_PRICE = 277;
export const ENROLLMENT_APPOINTMENT_SKILL_PRICE = 140;

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

  static getEnrollmentAppointmentSteps(isPhone: boolean) {
    // Enum value PaymentFail left out intentionally
    const commonSteps = [
      PublicEnrollmentAppointmentFormStep.Authenticate,
      PublicEnrollmentAppointmentFormStep.FillContactDetails,
      PublicEnrollmentAppointmentFormStep.Preview,
    ];

    if (isPhone) {
      return [
        ...commonSteps,
        PublicEnrollmentAppointmentFormStep.PaymentSuccess,
      ];
    } else {
      return commonSteps;
    }
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

  static calculateAppointmentPaymentSum(
    enrollmentAppointment: PublicEnrollmentAppointment,
  ) {
    if (enrollmentAppointment.textualSkill && enrollmentAppointment.oralSkill) {
      return 2 * ENROLLMENT_APPOINTMENT_SKILL_PRICE;
    } else {
      return ENROLLMENT_APPOINTMENT_SKILL_PRICE;
    }
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
