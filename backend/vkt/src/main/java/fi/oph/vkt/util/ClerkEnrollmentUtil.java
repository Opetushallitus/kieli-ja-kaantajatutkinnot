package fi.oph.vkt.util;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPaymentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPersonDTO;
import fi.oph.vkt.audit.dto.ClerkEnrollmentAuditDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.Person;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class ClerkEnrollmentUtil {

  public static ClerkEnrollmentDTO createClerkEnrollmentDTO(final Enrollment enrollment) {
    final ClerkPersonDTO personDTO = createClerkPersonDTO(enrollment.getPerson());

    final List<ClerkPaymentDTO> paymentDTOs = enrollment
      .getPayments()
      .stream()
      .map(ClerkPaymentUtil::createClerkPaymentDTO)
      .sorted(Comparator.comparing(ClerkPaymentDTO::createdAt).reversed())
      .collect(Collectors.toList());

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
