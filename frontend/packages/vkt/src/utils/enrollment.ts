import { StringUtils } from 'shared/utils';

import {
  CertificateShippingData,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';

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
}
