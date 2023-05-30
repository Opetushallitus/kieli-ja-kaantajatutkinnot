package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentMoveDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentStatusChangeDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentUpdateDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPaymentLinkDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.payment.Crypto;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import fi.oph.vkt.util.UUIDSource;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.Crypt;
import org.hibernate.id.UUIDGenerator;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkEnrollmentService extends AbstractEnrollmentService {

  private final EnrollmentRepository enrollmentRepository;
  private final PersonRepository personRepository;
  private final ExamEventRepository examEventRepository;
  private final AuditService auditService;
  private final Environment environment;
  private final UUIDSource uuidSource;

  @Transactional
  public ClerkEnrollmentDTO update(final ClerkEnrollmentUpdateDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    enrollment.assertVersion(dto.version());

    copyDtoFieldsToEnrollment(enrollment, dto);
    enrollmentRepository.flush();

    auditService.logById(VktOperation.UPDATE_ENROLLMENT, enrollment.getId());

    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(enrollmentRepository.getReferenceById(enrollment.getId()));
  }

  @Transactional
  public ClerkEnrollmentDTO changeStatus(final ClerkEnrollmentStatusChangeDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    enrollment.assertVersion(dto.version());

    enrollment.setStatus(dto.newStatus());
    enrollmentRepository.flush();

    auditService.logById(VktOperation.UPDATE_ENROLLMENT_STATUS, enrollment.getId());

    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(enrollmentRepository.getReferenceById(enrollment.getId()));
  }

  @Transactional
  public ClerkEnrollmentDTO move(final ClerkEnrollmentMoveDTO dto) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(dto.id());
    enrollment.assertVersion(dto.version());

    final ExamEvent toExamEvent = examEventRepository.getReferenceById(dto.toExamEventId());
    if (enrollment.getExamEvent().getLanguage() != toExamEvent.getLanguage()) {
      throw new APIException(APIExceptionType.ENROLLMENT_MOVE_EXAM_EVENT_LANGUAGE_MISMATCH);
    }
    if (isPersonEnrolled(toExamEvent, enrollment.getPerson(), enrollmentRepository)) {
      throw new APIException(APIExceptionType.ENROLLMENT_MOVE_PERSON_ALREADY_ENROLLED);
    }

    enrollment.setExamEvent(toExamEvent);
    enrollmentRepository.flush();

    auditService.logById(VktOperation.MOVE_ENROLLMENT, enrollment.getId());

    return ClerkEnrollmentUtil.createClerkEnrollmentDTO(enrollmentRepository.getReferenceById(enrollment.getId()));
  }

  @Transactional
  public ClerkPaymentLinkDTO createPaymentLink(final long enrollmentId) {
    final Enrollment enrollment = enrollmentRepository.getReferenceById(enrollmentId);
    final ExamEvent examEvent = enrollment.getExamEvent();
    final Person person = enrollment.getPerson();
    final String baseUrl = environment.getRequiredProperty("app.base-url.api");
    final String hash;

    if (person.getPaymentLinkHash() != null) {
      hash = person.getPaymentLinkHash();
    } else {
      hash = uuidSource.getRandomNonce();
      person.setPaymentLinkHash(hash);
    }

    person.setPaymentLinkExpires(LocalDateTime.now().plusDays(2));
    personRepository.saveAndFlush(person);

    return ClerkPaymentLinkDTO
      .builder()
      .url(String.format("%s/examEvent/%d/redirect/%s", baseUrl, examEvent.getId(), hash))
      .expires(person.getPaymentLinkExpires())
      .build();
  }
}
