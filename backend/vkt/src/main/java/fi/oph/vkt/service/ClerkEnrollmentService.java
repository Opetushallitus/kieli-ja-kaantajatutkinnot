package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentMoveDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentStatusChangeDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentUpdateDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPaymentLinkDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.audit.dto.ClerkEnrollmentAuditDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.PaymentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import fi.oph.vkt.util.UUIDSource;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkEnrollmentService extends AbstractEnrollmentService {

  private static final Logger LOG = LoggerFactory.getLogger(ClerkEnrollmentService.class);

  private final EnrollmentRepository enrollmentRepository;
  private final ExamEventRepository examEventRepository;
  private final PaymentRepository paymentRepository;
  private final PersonRepository personRepository;
  private final AuditService auditService;
  private final Environment environment;
  private final UUIDSource uuidSource;

  @Transactional
  public ClerkEnrollmentDTO update(final ClerkEnrollmentUpdateDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    final ClerkEnrollmentAuditDTO oldAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    enrollment.assertVersion(dto.version());

    copyDtoFieldsToEnrollment(enrollment, dto);
    enrollmentRepository.flush();

    final ClerkEnrollmentAuditDTO newAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    auditService.logUpdate(VktOperation.UPDATE_ENROLLMENT, enrollment.getId(), oldAuditDto, newAuditDto);

    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(enrollmentRepository.getReferenceById(enrollment.getId()));
  }

  @Transactional
  public ClerkEnrollmentDTO changeStatus(final ClerkEnrollmentStatusChangeDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    final ClerkEnrollmentAuditDTO oldAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    enrollment.assertVersion(dto.version());

    enrollment.setStatus(dto.newStatus());
    enrollmentRepository.flush();

    final ClerkEnrollmentAuditDTO newAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    auditService.logUpdate(VktOperation.UPDATE_ENROLLMENT_STATUS, enrollment.getId(), oldAuditDto, newAuditDto);

    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(enrollmentRepository.getReferenceById(enrollment.getId()));
  }

  @Transactional
  public ClerkEnrollmentDTO move(final ClerkEnrollmentMoveDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    final ClerkEnrollmentAuditDTO oldAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    enrollment.assertVersion(dto.version());

    final ExamEvent toExamEvent = examEventRepository.getReferenceById(dto.toExamEventId());
    if (enrollment.getExamEvent().getLanguage() != toExamEvent.getLanguage()) {
      throw new APIException(APIExceptionType.ENROLLMENT_MOVE_EXAM_EVENT_LANGUAGE_MISMATCH);
    }
    if (findEnrollment(toExamEvent, enrollment.getPerson(), enrollmentRepository).isPresent()) {
      throw new APIException(APIExceptionType.ENROLLMENT_MOVE_PERSON_ALREADY_ENROLLED);
    }

    enrollment.setExamEvent(toExamEvent);
    enrollmentRepository.flush();

    final ClerkEnrollmentAuditDTO newAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    auditService.logUpdate(VktOperation.MOVE_ENROLLMENT, enrollment.getId(), oldAuditDto, newAuditDto);

    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(enrollmentRepository.getReferenceById(enrollment.getId()));
  }

  @Transactional
  public ClerkPaymentLinkDTO createPaymentLink(final long enrollmentId) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(enrollmentId);
    final ExamEvent examEvent = enrollment.getExamEvent();
    final String baseUrl = environment.getRequiredProperty("app.base-url.api");
    final ClerkEnrollmentAuditDTO oldAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);

    if (enrollment.getPaymentLinkHash() == null) {
      enrollment.setPaymentLinkHash(uuidSource.getRandomNonce());
    }
    enrollment.setPaymentLinkExpiresAt(LocalDateTime.now().plusDays(1));
    enrollmentRepository.saveAndFlush(enrollment);

    final ClerkEnrollmentAuditDTO newAuditDto = ClerkEnrollmentUtil.createClerkEnrollmentAuditDTO(enrollment);
    auditService.logUpdate(VktOperation.UPDATE_ENROLLMENT_PAYMENT_LINK, enrollment.getId(), oldAuditDto, newAuditDto);

    return ClerkPaymentLinkDTO
      .builder()
      .url(String.format("%s/examEvent/%d/redirect/%s", baseUrl, examEvent.getId(), enrollment.getPaymentLinkHash()))
      .expiresAt(enrollment.getPaymentLinkExpiresAt())
      .build();
  }

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void cancelPassiveEnrollmentsExpectingPayment() {
    final Duration paymentTime = Duration.of(3, ChronoUnit.HOURS);

    enrollmentRepository
      .findAllByStatus(EnrollmentStatus.EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT)
      .stream()
      .filter(e -> e.getModifiedAt().plus(paymentTime).isBefore(LocalDateTime.now()))
      .forEach(enrollment -> {
        enrollment.setStatus(EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT);
        enrollmentRepository.saveAndFlush(enrollment);
      });
  }

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void deleteCanceledUnfinishedEnrollments() {
    final Duration ttl = Duration.of(24, ChronoUnit.HOURS);

    enrollmentRepository
      .findAllByStatus(EnrollmentStatus.CANCELED_UNFINISHED_ENROLLMENT)
      .stream()
      .filter(e -> e.getModifiedAt().plus(ttl).isBefore(LocalDateTime.now()))
      .forEach(enrollment -> {
        final List<Payment> payments = enrollment.getPayments();

        if (payments.stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.OK)) {
          LOG.warn(String.format("Tried to delete enrollment (%d) with paid payment", enrollment.getId()));
        } else {
          paymentRepository.deleteAllInBatch(payments);
          enrollmentRepository.deleteById(enrollment.getId());
        }
      });
  }

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void anonymizeEnrollments() {
    enrollmentRepository
      .findAllToAnonymize(LocalDate.now().minusDays(180))
      .forEach(enrollment -> {
        anonymizeEnrollment(enrollment);

        final Person person = enrollment.getPerson();
        if (person.getEnrollments().stream().allMatch(Enrollment::isAnonymized)) {
          anonymizePerson(person);
        }
      });
  }

  private void anonymizeEnrollment(final Enrollment enrollment) {
    enrollment.setEmail("anonymisoitu.ilmoittautuja@vkt.vkt");
    enrollment.setPhoneNumber("+0000000");

    if (enrollment.getStreet() != null) {
      enrollment.setStreet("Testitie 1");
    }
    if (enrollment.getPostalCode() != null) {
      enrollment.setPostalCode("00000");
    }
    if (enrollment.getTown() != null) {
      enrollment.setTown("Kaupunki");
    }
    if (enrollment.getCountry() != null) {
      enrollment.setCountry("Maa");
    }

    enrollment.setAnonymized(true);
    enrollmentRepository.saveAndFlush(enrollment);
  }

  private void anonymizePerson(final Person person) {
    person.setLastName("Ilmoittautuja");
    person.setFirstName("Anonymisoitu");

    personRepository.saveAndFlush(person);
  }
}
