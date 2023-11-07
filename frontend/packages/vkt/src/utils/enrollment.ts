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
    serverEnrollment: PublicEnrollment,
  ): PublicEnrollment {
    // If email value has been given in local state,
    // then local values must be newer and thus overwrite
    const hasLocalValues = localEnrollment['email'] !== '';

    if (hasLocalValues) {
      return {
        ...localEnrollment,
        status: serverEnrollment.status,
      };
    } else {
      return serverEnrollment;
    }
  }
}
