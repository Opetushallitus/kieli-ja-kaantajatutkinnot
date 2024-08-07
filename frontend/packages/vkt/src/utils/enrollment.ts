import { StringUtils } from 'shared/utils';

import { EnrollmentStatus } from 'enums/app';
import { ClerkEnrollment } from 'interfaces/clerkEnrollment';
import {
  CertificateShippingData,
  PartialExamsAndSkills,
} from 'interfaces/common/enrollment';
import {
  EducationType,
  FreeBasisSource,
  PublicFreeEnrollmentDetails,
} from 'interfaces/publicEducation';
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

  static isValidAttachmentsIfRequired(enrollment: PublicEnrollment) {
    if (
      !enrollment.freeEnrollmentBasis ||
      enrollment.freeEnrollmentBasis.source !== FreeBasisSource.User ||
      enrollment.freeEnrollmentBasis.type === EducationType.None
    ) {
      return true;
    }

    return !!(
      enrollment.freeEnrollmentBasis.attachments &&
      enrollment.freeEnrollmentBasis.attachments.length > 0
    );
  }

  static isValidFreeBasisIfRequired(
    enrollment: PublicEnrollment,
    freeEnrollmentDetails?: PublicFreeEnrollmentDetails,
  ) {
    // If no free enrollment details, then assume
    // no free enrollments left and free basis is not required
    if (
      !freeEnrollmentDetails ||
      !EnrollmentUtils.hasFreeEnrollmentsLeft(freeEnrollmentDetails)
    ) {
      return true;
    }

    return !!enrollment.freeEnrollmentBasis;
  }

  static hasFreeEnrollmentsLeft(
    freeEnrollmentDetails?: PublicFreeEnrollmentDetails,
  ) {
    return (
      freeEnrollmentDetails &&
      (freeEnrollmentDetails.freeOralSkillLeft > 0 ||
        freeEnrollmentDetails.freeTextualSkillLeft > 0)
    );
  }

  static hasFreeBasis(enrollment: PublicEnrollment | ClerkEnrollment) {
    return (
      enrollment.freeEnrollmentBasis &&
      enrollment.freeEnrollmentBasis.type !== EducationType.None
    );
  }

  static isFree(
    enrollment: PublicEnrollment,
    freeEnrollmentDetails?: PublicFreeEnrollmentDetails,
  ) {
    if (!EnrollmentUtils.hasFreeBasis(enrollment) || !freeEnrollmentDetails) {
      return false;
    }

    if (
      freeEnrollmentDetails.freeOralSkillLeft <= 0 &&
      freeEnrollmentDetails.freeTextualSkillLeft <= 0
    ) {
      return false;
    }

    if (enrollment.oralSkill && freeEnrollmentDetails.freeOralSkillLeft <= 0) {
      return false;
    }

    if (
      enrollment.textualSkill &&
      freeEnrollmentDetails.freeTextualSkillLeft <= 0
    ) {
      return false;
    }

    return true;
  }

  static isPaymentRequired(enrollment: PublicEnrollment) {
    return (
      enrollment.status == EnrollmentStatus.AWAITING_PAYMENT ||
      enrollment.status ==
        EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT
    );
  }

  static isQueued(enrollment: PublicEnrollment) {
    return enrollment.status == EnrollmentStatus.QUEUED;
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
