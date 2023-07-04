import { StringUtils } from 'shared/utils';

import {
  CertificateShippingData,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';

export class EnrollmentUtils {
  static isValidTextualSkillAndPartialExams(skills: PartialExamsAndSkills) {
    return skills.textualSkill
      ? skills.writingPartialExam || skills.readingComprehensionPartialExam
      : true;
  }

  static isValidOralSkillAndPartialExams(skills: PartialExamsAndSkills) {
    return skills.oralSkill
      ? skills.speakingPartialExam || skills.speechComprehensionPartialExam
      : true;
  }

  // TODO: clerk use case could be potentially replaced with the above two validity methods
  static isValidPartialExamsAndSkills(skills: PartialExamsAndSkills) {
    const isSkillsSelected =
      skills.oralSkill || skills.textualSkill || skills.understandingSkill;

    const isOralExamsSelected = skills.oralSkill
      ? skills.speakingPartialExam || skills.speechComprehensionPartialExam
      : true;

    const isTextualExamsSelected = skills.textualSkill
      ? skills.writingPartialExam || skills.readingComprehensionPartialExam
      : true;

    const isUnderstandingExamsSelected = skills.understandingSkill
      ? skills.speechComprehensionPartialExam ||
        skills.readingComprehensionPartialExam
      : true;

    return (
      isSkillsSelected &&
      isOralExamsSelected &&
      isTextualExamsSelected &&
      isUnderstandingExamsSelected
    );
  }

  static isValidCertificateShipping(shippingData: CertificateShippingData) {
    const isAddressFieldsFilled = [
      shippingData.street,
      shippingData.postalCode,
      shippingData.town,
      shippingData.country,
    ].every(StringUtils.isNonBlankString);

    return shippingData.digitalCertificateConsent || isAddressFieldsFilled;
  }

  static mergeEnrollment(
    localEnrollment: PublicEnrollment,
    serverEnrollment: PublicEnrollment
  ): PublicEnrollment {
    // If email value has been given in local state,
    // then local values must be newer and thus overwrite
    const hasLocalValues = localEnrollment['email'] !== '';

    return {
      id: serverEnrollment.id,
      status: serverEnrollment.status,
      privacyStatementConfirmation:
        localEnrollment.privacyStatementConfirmation,
      emailConfirmation: localEnrollment.emailConfirmation,
      oralSkill: hasLocalValues
        ? localEnrollment.oralSkill
        : serverEnrollment.oralSkill,
      textualSkill: hasLocalValues
        ? localEnrollment.textualSkill
        : serverEnrollment.textualSkill,
      understandingSkill: hasLocalValues
        ? localEnrollment.understandingSkill
        : serverEnrollment.understandingSkill,
      speakingPartialExam: hasLocalValues
        ? localEnrollment.speakingPartialExam
        : serverEnrollment.speakingPartialExam,
      speechComprehensionPartialExam: hasLocalValues
        ? localEnrollment.speechComprehensionPartialExam
        : serverEnrollment.speechComprehensionPartialExam,
      writingPartialExam: hasLocalValues
        ? localEnrollment.writingPartialExam
        : serverEnrollment.writingPartialExam,
      readingComprehensionPartialExam: hasLocalValues
        ? localEnrollment.readingComprehensionPartialExam
        : serverEnrollment.readingComprehensionPartialExam,
      previousEnrollment: hasLocalValues
        ? localEnrollment.previousEnrollment
        : serverEnrollment.previousEnrollment,
      digitalCertificateConsent: hasLocalValues
        ? localEnrollment.digitalCertificateConsent
        : serverEnrollment.digitalCertificateConsent,
      email: hasLocalValues ? localEnrollment.email : serverEnrollment.email,
      phoneNumber: hasLocalValues
        ? localEnrollment.phoneNumber
        : serverEnrollment.phoneNumber,
      street: hasLocalValues ? localEnrollment.street : serverEnrollment.street,
      postalCode: hasLocalValues
        ? localEnrollment.postalCode
        : serverEnrollment.postalCode,
      town: hasLocalValues ? localEnrollment.town : serverEnrollment.town,
      country: hasLocalValues
        ? localEnrollment.country
        : serverEnrollment.country,
    };
  }
}
