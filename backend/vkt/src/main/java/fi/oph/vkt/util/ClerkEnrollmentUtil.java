package fi.oph.vkt.util;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamPaymentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPersonDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import java.util.List;
import java.util.stream.Collectors;

public class ClerkEnrollmentUtil {

  public static ClerkEnrollmentDTO createClerkEnrollmentDTO(final Enrollment enrollment) {
    final ClerkPersonDTO personDTO = createClerkPersonDTO(enrollment.getPerson());
    final List<ClerkExamPaymentDTO> paymentDTOs = createClerkPaymentDTO(enrollment.getPayments());

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

  private static List<ClerkExamPaymentDTO> createClerkPaymentDTO(final List<Payment> payments) {
    return payments
      .stream()
      .map((final Payment payment) ->
        ClerkExamPaymentDTO
          .builder()
          .id(payment.getId())
          .paymentId(payment.getTransactionId())
          .version(payment.getVersion())
          .amount(payment.getAmount())
          .modifiedAt(payment.getModifiedAt())
          .status(payment.getPaymentStatus())
          .build()
      )
      .collect(Collectors.toList());
  }

  private static ClerkPersonDTO createClerkPersonDTO(final Person person) {
    return ClerkPersonDTO
      .builder()
      .id(person.getId())
      .version(person.getVersion())
      .identityNumber(person.getIdentityNumber())
      .lastName(person.getLastName())
      .firstName(person.getFirstName())
      .build();
  }
}
