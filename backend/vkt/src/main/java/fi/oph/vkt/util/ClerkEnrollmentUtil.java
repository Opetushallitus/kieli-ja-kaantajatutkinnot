package fi.oph.vkt.util;

import fi.oph.vkt.api.dto.FreeEnrollmentAttachmentDTO;
import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.api.dto.FreeEnrollmentDetailsDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkFeeEnrollmentBasisDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPaymentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPersonDTO;
import fi.oph.vkt.audit.dto.ClerkEnrollmentAuditDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.FreeEnrollment;
import fi.oph.vkt.model.Person;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class ClerkEnrollmentUtil {

  public static ClerkEnrollmentDTO createClerkEnrollmentDTO(
    final Enrollment enrollment,
    final FreeEnrollmentDetails freeEnrollmentDetails
  ) {
    final ClerkPersonDTO personDTO = createClerkPersonDTO(enrollment.getPerson());

    final List<ClerkPaymentDTO> paymentDTOs = enrollment
      .getPayments()
      .stream()
      .map(ClerkPaymentUtil::createClerkPaymentDTO)
      .sorted(Comparator.comparing(ClerkPaymentDTO::createdAt).reversed())
      .collect(Collectors.toList());

    final FreeEnrollment freeEnrollment = enrollment.getFreeEnrollment();
    final ClerkFeeEnrollmentBasisDTO freeEnrollmentBasisDTO = freeEnrollment != null
      ? ClerkFeeEnrollmentBasisDTO
        .builder()
        .type(freeEnrollment.getType())
        .source(freeEnrollment.getSource())
        .approved(freeEnrollment.getApproved())
        .comment(freeEnrollment.getComment())
        .attachments(
          freeEnrollment
            .getAttachments()
            .stream()
            .map(attachment ->
              new FreeEnrollmentAttachmentDTO(attachment.getFilename(), attachment.getKey(), attachment.getSize())
            )
            .collect(Collectors.toList())
        )
        .build()
      : null;

    final FreeEnrollmentDetailsDTO freeEnrollmentDetailsDTO = freeEnrollmentDetails == null
      ? null
      : FreeEnrollmentDetailsDTO
        .builder()
        .freeOralSkillLeft(Math.max(0, 3 - freeEnrollmentDetails.oralSkillCount()))
        .freeTextualSkillLeft(Math.max(0, 3 - freeEnrollmentDetails.textualSkillCount()))
        .build();

    return ClerkEnrollmentDTO
      .builder()
      .id(enrollment.getId())
      .version(enrollment.getVersion())
      .enrollmentTime(enrollment.getCreatedAt())
      .person(personDTO)
      .oralSkill(enrollment.isOralSkill())
      .textualSkill(enrollment.isTextualSkill())
      .understandingSkill(enrollment.isUnderstandingSkill())
      .speakingPartialExam(enrollment.isSpeakingPartialExam())
      .speechComprehensionPartialExam(enrollment.isSpeechComprehensionPartialExam())
      .writingPartialExam(enrollment.isWritingPartialExam())
      .readingComprehensionPartialExam(enrollment.isReadingComprehensionPartialExam())
      .status(enrollment.getStatus())
      .previousEnrollment(enrollment.getPreviousEnrollment())
      .digitalCertificateConsent(enrollment.isDigitalCertificateConsent())
      .email(enrollment.getEmail())
      .phoneNumber(enrollment.getPhoneNumber())
      .street(enrollment.getStreet())
      .postalCode(enrollment.getPostalCode())
      .town(enrollment.getTown())
      .country(enrollment.getCountry())
      .payments(paymentDTOs)
      .freeEnrollmentBasis(freeEnrollmentBasisDTO)
      .freeEnrollmentDetails(freeEnrollmentDetailsDTO)
      .build();
  }

  private static ClerkPersonDTO createClerkPersonDTO(final Person person) {
    return ClerkPersonDTO
      .builder()
      .id(person.getId())
      .version(person.getVersion())
      .lastName(person.getLastName())
      .firstName(person.getFirstName())
      .build();
  }

  public static ClerkEnrollmentAuditDTO createClerkEnrollmentAuditDTO(final Enrollment enrollment) {
    return ClerkEnrollmentAuditDTO
      .builder()
      .id(enrollment.getId())
      .version(enrollment.getVersion())
      .modifiedAt(DateUtil.formatOptionalDatetime(enrollment.getModifiedAt()))
      .examEventId(enrollment.getExamEvent().getId())
      .personId(enrollment.getPerson().getId())
      .oralSkill(enrollment.isOralSkill())
      .textualSkill(enrollment.isTextualSkill())
      .understandingSkill(enrollment.isUnderstandingSkill())
      .speakingPartialExam(enrollment.isSpeakingPartialExam())
      .speechComprehensionPartialExam(enrollment.isSpeechComprehensionPartialExam())
      .writingPartialExam(enrollment.isWritingPartialExam())
      .readingComprehensionPartialExam(enrollment.isReadingComprehensionPartialExam())
      .status(enrollment.getStatus())
      .previousEnrollment(enrollment.getPreviousEnrollment())
      .digitalCertificateConsent(enrollment.isDigitalCertificateConsent())
      .email(enrollment.getEmail())
      .phoneNumber(enrollment.getPhoneNumber())
      .street(enrollment.getStreet())
      .postalCode(enrollment.getPostalCode())
      .town(enrollment.getTown())
      .country(enrollment.getCountry())
      .paymentLinkHash(enrollment.getPaymentLinkHash())
      .paymentLinkExpiresAt(DateUtil.formatOptionalDatetime(enrollment.getPaymentLinkExpiresAt()))
      .build();
  }
}
