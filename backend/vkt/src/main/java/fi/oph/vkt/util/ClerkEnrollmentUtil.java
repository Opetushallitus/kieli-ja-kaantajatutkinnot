package fi.oph.vkt.util;

import fi.oph.vkt.api.dto.FreeEnrollmentAttachmentDTO;
import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.api.dto.FreeEnrollmentDetailsDTO;
import fi.oph.vkt.api.dto.KoskiEducationsDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkFreeEnrollmentBasisDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPaymentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPersonDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerAuthLinkDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentHistoryDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentContactRequestDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventDTO;
import fi.oph.vkt.audit.dto.ClerkEnrollmentAuditDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentGrade;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.FreeEnrollment;
import fi.oph.vkt.model.KoskiEducations;
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
    KoskiEducationsDTO koskiEducationsDTO = null;
    if (freeEnrollment != null && freeEnrollment.getKoskiEducations() != null) {
      koskiEducationsDTO = createKoskiEducationsDTO(freeEnrollment.getKoskiEducations());
    }

    final ClerkFreeEnrollmentBasisDTO freeEnrollmentBasisDTO = freeEnrollment != null
      ? ClerkFreeEnrollmentBasisDTO
        .builder()
        .type(freeEnrollment.getType())
        .source(freeEnrollment.getSource())
        .approved(freeEnrollment.getApproved())
        .comment(freeEnrollment.getComment())
        .koskiEducations(koskiEducationsDTO)
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
        .freeOralSkillLeft(EnrollmentUtil.getFreeExamsLeft(freeEnrollmentDetails.oralSkillCount()))
        .freeTextualSkillLeft(EnrollmentUtil.getFreeExamsLeft(freeEnrollmentDetails.textualSkillCount()))
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
      .oid(person.getOid())
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

  public static KoskiEducationsDTO createKoskiEducationsDTO(final KoskiEducations koskiEducations) {
    return KoskiEducationsDTO
      .builder()
      .matriculationExam(koskiEducations.getMatriculationExam())
      .higherEducationConcluded(koskiEducations.getHigherEducationConcluded())
      .higherEducationEnrolled(koskiEducations.getHigherEducationEnrolled())
      .dia(koskiEducations.getDia())
      .eb(koskiEducations.getEb())
      .other(koskiEducations.getOther())
      .build();
  }

  public static String getAuthUrl(final String baseUrlAPI, final long id, final String hash) {
    return String.format("%s/enrollment/appointment/%d/redirect/%s", baseUrlAPI, id, hash);
  }

  public static ExaminerEnrollmentAppointmentDTO createClerkEnrollmentAppointmentDTO(
    final EnrollmentAppointment enrollmentAppointment,
    final String baseUrlAPI
  ) {
    final ClerkPersonDTO personDTO = enrollmentAppointment.getPerson() != null
      ? createClerkPersonDTO(enrollmentAppointment.getPerson())
      : null;
    final List<ClerkPaymentDTO> paymentDTOs = enrollmentAppointment
      .getPayments()
      .stream()
      .map(ClerkPaymentUtil::createClerkPaymentDTO)
      .sorted(Comparator.comparing(ClerkPaymentDTO::createdAt).reversed())
      .toList();
    final List<FreeEnrollmentAttachmentDTO> attachmentDTOs = enrollmentAppointment
      .getAttachments()
      .stream()
      .map(a -> new FreeEnrollmentAttachmentDTO(a.getFilename(), a.getKey(), a.getSize()))
      .collect(Collectors.toList());

    final ExaminerAuthLinkDTO examinerAuthLinkDTO = enrollmentAppointment.getAuthHash() != null
      ? ExaminerAuthLinkDTO
        .builder()
        .url(getAuthUrl(baseUrlAPI, enrollmentAppointment.getId(), enrollmentAppointment.getAuthHash()))
        .expiresAt(enrollmentAppointment.getExpiresAt())
        .sentAt(enrollmentAppointment.getSentAt())
        .build()
      : null;

    final String paymentLinkUrl = enrollmentAppointment.getPaymentLinkHash() != null
      ? String.format(
        "%s/enrollment/appointment/%d/redirectPayment/%s",
        baseUrlAPI,
        enrollmentAppointment.getId(),
        enrollmentAppointment.getPaymentLinkHash()
      )
      : "";

    final ExaminerExamEventDTO examinerExamEventDTO = enrollmentAppointment.getExaminerExamEvent() != null
      ? ExaminerUtil.toExaminerExamEventWithoutEnrollmentsDTO(enrollmentAppointment.getExaminerExamEvent())
      : null;

    return ExaminerEnrollmentAppointmentDTO
      .builder()
      .id(enrollmentAppointment.getId())
      .version(enrollmentAppointment.getVersion())
      .enrollmentTime(enrollmentAppointment.getCreatedAt())
      .person(personDTO)
      .oralSkill(enrollmentAppointment.isOralSkill())
      .textualSkill(enrollmentAppointment.isTextualSkill())
      .understandingSkill(enrollmentAppointment.isUnderstandingSkill())
      .speakingPartialExam(enrollmentAppointment.isSpeakingPartialExam())
      .speechComprehensionPartialExam(enrollmentAppointment.isSpeechComprehensionPartialExam())
      .writingPartialExam(enrollmentAppointment.isWritingPartialExam())
      .readingComprehensionPartialExam(enrollmentAppointment.isReadingComprehensionPartialExam())
      .street(enrollmentAppointment.getStreet())
      .postalCode(enrollmentAppointment.getPostalCode())
      .town(enrollmentAppointment.getTown())
      .country(enrollmentAppointment.getCountry())
      .status(enrollmentAppointment.getStatus())
      .email(enrollmentAppointment.getEmail())
      .phoneNumber(enrollmentAppointment.getPhoneNumber())
      .firstName(enrollmentAppointment.getFirstName())
      .lastName(enrollmentAppointment.getLastName())
      .authLink(examinerAuthLinkDTO)
      .paymentLinkUrl(paymentLinkUrl)
      .examEvent(examinerExamEventDTO)
      .payments(paymentDTOs)
      .hasPreviousEnrollment(enrollmentAppointment.isHasPreviousEnrollment())
      .previousEnrollment(enrollmentAppointment.getPreviousEnrollment())
      .attachments(attachmentDTOs)
      .build();
  }

  public static ExaminerEnrollmentContactRequestDTO createClerkEnrollmentContactDTO(
    final EnrollmentAppointment enrollmentAppointment
  ) {
    final List<FreeEnrollmentAttachmentDTO> attachmentDTOs = enrollmentAppointment
      .getAttachments()
      .stream()
      .map(a -> new FreeEnrollmentAttachmentDTO(a.getFilename(), a.getKey(), a.getSize()))
      .collect(Collectors.toList());

    return ExaminerEnrollmentContactRequestDTO
      .builder()
      .id(enrollmentAppointment.getId())
      .version(enrollmentAppointment.getVersion())
      .enrollmentTime(enrollmentAppointment.getCreatedAt())
      .isFullExam(enrollmentAppointment.getPartialExamSelection() == null)
      .partialExamSelection(enrollmentAppointment.getPartialExamSelection())
      .status(enrollmentAppointment.getStatus())
      .phoneNumber(enrollmentAppointment.getPhoneNumber())
      .email(enrollmentAppointment.getEmail())
      .firstName(enrollmentAppointment.getFirstName())
      .lastName(enrollmentAppointment.getLastName())
      .hasPreviousEnrollment(enrollmentAppointment.isHasPreviousEnrollment())
      .message(enrollmentAppointment.getMessage())
      .attachments(attachmentDTOs)
      .build();
  }

  public static ExaminerEnrollmentAppointmentHistoryDTO createClerkEnrollmentAppointmentHistoryDTO(
    final EnrollmentAppointment enrollmentAppointment
  ) {
    final Examiner examiner = enrollmentAppointment.getExaminer();
    final ExaminerExamEventDTO examinerExamEventDTO = enrollmentAppointment.getExaminerExamEvent() != null
      ? ExaminerUtil.toExaminerExamEventWithoutEnrollmentsDTO(enrollmentAppointment.getExaminerExamEvent())
      : null;
    final EnrollmentGrade grade = enrollmentAppointment.getGrade();

    return ExaminerEnrollmentAppointmentHistoryDTO
      .builder()
      .enrollmentTime(enrollmentAppointment.getCreatedAt())
      .oralSkill(enrollmentAppointment.isOralSkill())
      .textualSkill(enrollmentAppointment.isTextualSkill())
      .understandingSkill(enrollmentAppointment.isUnderstandingSkill())
      .speakingPartialExam(enrollmentAppointment.isSpeakingPartialExam())
      .speechComprehensionPartialExam(enrollmentAppointment.isSpeechComprehensionPartialExam())
      .writingPartialExam(enrollmentAppointment.isWritingPartialExam())
      .readingComprehensionPartialExam(enrollmentAppointment.isReadingComprehensionPartialExam())
      .examEvent(examinerExamEventDTO)
      .examinerName(examiner.getNickname() + " " + examiner.getLastName())
      .grades(grade != null ? ExaminerUtil.createGradesDTO(grade) : null)
      .build();
  }
}
