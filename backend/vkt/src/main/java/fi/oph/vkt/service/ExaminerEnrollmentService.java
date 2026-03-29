package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentMoveDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentHistoryDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentUpdateDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentBirthdateOrSsnDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentContactRequestDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentExamEventDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentGradesDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerOnrBirthdateDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentGrade;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
import fi.oph.vkt.repository.EnrollmentAppointmentRepository;
import fi.oph.vkt.repository.EnrollmentGradesRepository;
import fi.oph.vkt.repository.ExaminerExamEventRepository;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.onr.OnrService;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import fi.oph.vkt.util.DateUtil;
import fi.oph.vkt.util.ExaminerUtil;
import fi.oph.vkt.util.HetuUtils;
import fi.oph.vkt.util.UUIDSource;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExaminerEnrollmentService extends AbstractEnrollmentService {

  private final EnrollmentAppointmentRepository enrollmentAppointmentRepository;
  private final EnrollmentGradesRepository enrollmentGradesRepository;
  private final ExaminerExamEventRepository examinerExamEventRepository;
  private final Environment environment;
  private final UUIDSource uuidSource;
  private final ExaminerEnrollmentEmailService examinerEnrollmentEmailService;
  private final AuditService auditService;
  private final OnrService onrService;
  private final PersonRepository personRepository;

  private static void checkExaminerOid(EnrollmentAppointment enrollmentAppointment, String oid) {
    if (!enrollmentAppointment.getExaminer().getOid().equals(oid)) {
      throw new APIException(APIExceptionType.EXAMINER_ENROLLMENT_OID_MISMATCH);
    }
  }

  @Transactional
  public ExaminerEnrollmentAppointmentDTO updateAppointment(
    final String oid,
    final Long id,
    final ExaminerEnrollmentAppointmentUpdateDTO dto
  ) {
    // TODO Audit log entry
    if (!Objects.equals(id, dto.id())) {
      throw new APIException(APIExceptionType.EXAMINER_APPOINTMENT_ID_MISMATCH);
    }
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(dto.id());
    checkExaminerOid(enrollmentAppointment, oid);
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    enrollmentAppointment.assertVersion(dto.version());

    if (dto.examEvent() != null) {
      final ExaminerExamEvent examinerExamEvent = examinerExamEventRepository.getReferenceById(dto.examEvent());
      enrollmentAppointment.setExaminerExamEvent(examinerExamEvent);
    }

    copyDtoFieldsToEnrollment(enrollmentAppointment, dto);
    enrollmentAppointmentRepository.flush();

    return ClerkEnrollmentUtil.createClerkEnrollmentAppointmentDTO(enrollmentAppointment, baseUrlAPI);
  }

  @Transactional(readOnly = true)
  public ExaminerEnrollmentContactRequestDTO getEnrollmentContactRequest(
    final String oid,
    final long enrollmentContactId
  ) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentContactId
    );
    checkExaminerOid(enrollmentAppointment, oid);

    auditService.logById(VktOperation.VIEW_EXAMINER_CONTACT_REQUEST, enrollmentContactId);

    return ClerkEnrollmentUtil.createClerkEnrollmentContactDTO(enrollmentAppointment);
  }

  @Transactional
  public ExaminerEnrollmentAppointmentDTO convertToAppointment(
    final String oid,
    final long enrollmentContactId,
    final ExaminerEnrollmentExamEventDTO examEvent
  ) {
    auditService.logById(VktOperation.CONVERT_EXAMINER_CONTACT_REQUEST, enrollmentContactId);

    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentContactId
    );
    final ExaminerExamEvent examinerExamEvent = examinerExamEventRepository.getReferenceById(examEvent.id());
    checkExaminerOid(enrollmentAppointment, oid);

    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    if (EnrollmentAppointmentStatus.COMPLETED.equals(enrollmentAppointment.getStatus())) {
      throw new APIException(APIExceptionType.EXAMINER_CONVERT_ENROLLMENT_ALREADY_COMPLETED);
    }

    enrollmentAppointment.setStatus(EnrollmentAppointmentStatus.ENROLLMENT_CREATED);
    enrollmentAppointment.setExaminerExamEvent(examinerExamEvent);

    if (enrollmentAppointment.getAuthHash() == null) {
      enrollmentAppointment.setAuthHash(uuidSource.getRandomNonce());
    }

    enrollmentAppointmentRepository.flush();

    auditService.logById(VktOperation.CONVERT_EXAMINER_CONTACT_REQUEST_TO_APPOINTMENT, enrollmentContactId);

    return ClerkEnrollmentUtil.createClerkEnrollmentAppointmentDTO(enrollmentAppointment, baseUrlAPI);
  }

  @Transactional(readOnly = true)
  public ExaminerEnrollmentGradesDTO getAppointmentGrades(final String oid, final long enrollmentAppointmentId) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentAppointmentId
    );
    checkExaminerOid(enrollmentAppointment, oid);
    final Optional<EnrollmentGrade> enrollmentGradeOptional = enrollmentGradesRepository.findByEnrollmentAppointment(
      enrollmentAppointment
    );

    auditService.logById(VktOperation.VIEW_EXAMINER_ENROLLMENT_GRADES, enrollmentAppointmentId);

    return enrollmentGradeOptional.map(ExaminerUtil::createGradesDTO).orElse(null);
  }

  @Transactional(readOnly = true)
  public ExaminerEnrollmentAppointmentDTO getEnrollmentAppointment(
    final String oid,
    final long enrollmentAppointmentId
  ) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentAppointmentId
    );

    checkExaminerOid(enrollmentAppointment, oid);

    auditService.logById(VktOperation.VIEW_EXAMINER_ENROLLMENT, enrollmentAppointmentId);

    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    return ClerkEnrollmentUtil.createClerkEnrollmentAppointmentDTO(enrollmentAppointment, baseUrlAPI);
  }

  @Transactional
  public ExaminerEnrollmentGradesDTO upsertAppointmentGrades(
    final String oid,
    final long enrollmentAppointmentId,
    final ExaminerEnrollmentGradesDTO dto
  ) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentAppointmentId
    );

    checkExaminerOid(enrollmentAppointment, oid);

    final Optional<EnrollmentGrade> enrollmentGradeOptional = enrollmentGradesRepository.findByEnrollmentAppointment(
      enrollmentAppointment
    );
    final EnrollmentGrade enrollmentGrade = enrollmentGradeOptional.orElseGet(EnrollmentGrade::new);

    enrollmentGrade.assertVersion(dto.version());
    if (dto.speakingPartialExam() != null) {
      enrollmentGrade.setSpeakingPartialExamGrade(dto.speakingPartialExam().grade());
      enrollmentGrade.setSpeakingPartialExamComment(dto.speakingPartialExam().comment());
    } else {
      enrollmentGrade.setSpeakingPartialExamGrade(null);
      enrollmentGrade.setSpeakingPartialExamComment(null);
    }

    if (dto.writingPartialExam() != null) {
      enrollmentGrade.setWritingPartialExamGrade(dto.writingPartialExam().grade());
      enrollmentGrade.setWritingPartialExamComment(dto.writingPartialExam().comment());
    } else {
      enrollmentGrade.setWritingPartialExamGrade(null);
      enrollmentGrade.setWritingPartialExamComment(null);
    }

    if (dto.speechComprehensionPartialExam() != null) {
      enrollmentGrade.setSpeechComprehensionPartialExamGrade(dto.speechComprehensionPartialExam().grade());
      enrollmentGrade.setSpeechComprehensionPartialExamComment(dto.speechComprehensionPartialExam().comment());
    } else {
      enrollmentGrade.setSpeechComprehensionPartialExamGrade(null);
      enrollmentGrade.setSpeechComprehensionPartialExamComment(null);
    }

    if (dto.readingComprehensionPartialExam() != null) {
      enrollmentGrade.setReadingComprehensionPartialExamGrade(dto.readingComprehensionPartialExam().grade());
      enrollmentGrade.setReadingComprehensionPartialExamComment(dto.readingComprehensionPartialExam().comment());
    } else {
      enrollmentGrade.setReadingComprehensionPartialExamGrade(null);
      enrollmentGrade.setReadingComprehensionPartialExamComment(null);
    }

    enrollmentGradesRepository.saveAndFlush(enrollmentGrade);

    enrollmentAppointment.setGrade(enrollmentGrade);
    enrollmentAppointmentRepository.saveAndFlush(enrollmentAppointment);

    return ExaminerUtil.createGradesDTO(enrollmentGrade);
  }

  @Transactional
  public ExaminerEnrollmentAppointmentDTO sendEnrollmentAppointmentLink(
    final String oid,
    final long enrollmentAppointmentId
  ) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentAppointmentId
    );
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    checkExaminerOid(enrollmentAppointment, oid);

    enrollmentAppointment.setExpiresAt(LocalDate.now().atTime(LocalTime.MAX).plusDays(3).minusMinutes(1));
    enrollmentAppointment.setSentAt(LocalDateTime.now());
    enrollmentAppointment.setStatus(EnrollmentAppointmentStatus.WAITING_AUTHENTICATION);

    examinerEnrollmentEmailService.sendEnrollmentAppointmentAuthLink(enrollmentAppointment);

    enrollmentAppointmentRepository.flush();

    return ClerkEnrollmentUtil.createClerkEnrollmentAppointmentDTO(enrollmentAppointment, baseUrlAPI);
  }

  @Transactional
  public void deleteEnrollmentContactRequest(final String oid, final long enrollmentContactId) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentContactId
    );

    checkExaminerOid(enrollmentAppointment, oid);

    auditService.logById(VktOperation.DELETE_EXAMINER_CONTACT_REQUEST, enrollmentContactId);

    enrollmentAppointment.setDeletedAt(LocalDateTime.now());

    enrollmentAppointmentRepository.flush();
  }

  @Transactional
  public void cancelEnrollmentAppointment(final String oid, final long enrollmentAppointmentId) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentAppointmentId
    );

    checkExaminerOid(enrollmentAppointment, oid);

    enrollmentAppointment.setStatus(EnrollmentAppointmentStatus.CANCELED);

    auditService.logById(VktOperation.CANCEL_ENROLLMENT_APPOINTMENT, enrollmentAppointmentId);

    enrollmentAppointmentRepository.flush();
  }

  @Transactional(readOnly = true)
  public List<ExaminerEnrollmentAppointmentHistoryDTO> getEnrollmentAppointmentHistory(
    final String oid,
    final long enrollmentAppointmentId
  ) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentAppointmentId
    );

    checkExaminerOid(enrollmentAppointment, oid);

    final Person person = enrollmentAppointment.getPerson();
    if (person == null) {
      return List.of();
    }

    auditService.logById(VktOperation.VIEW_EXAMINER_ENROLLMENT_HISTORY, enrollmentAppointmentId);

    final List<EnrollmentAppointment> enrollmentAppointments = enrollmentAppointmentRepository.findPersonEnrollmentHistory(
      person
    );

    return enrollmentAppointments
      .stream()
      .filter(e -> e.getId() != enrollmentAppointmentId)
      .map(ClerkEnrollmentUtil::createClerkEnrollmentAppointmentHistoryDTO)
      .toList();
  }

  @Transactional
  public ExaminerEnrollmentAppointmentDTO move(final String oid, final ClerkEnrollmentMoveDTO dto) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(dto.id());
    final ExaminerExamEvent newExaminerExamEvent = examinerExamEventRepository.getReferenceById(dto.toExamEventId());
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    enrollmentAppointment.assertVersion(dto.version());
    checkExaminerOid(enrollmentAppointment, oid);

    if (enrollmentAppointment.getExaminer().getId() != newExaminerExamEvent.getExaminer().getId()) {
      throw new APIException(APIExceptionType.EXAMINER_NEW_EXAM_EVENT_MISMATCH);
    }

    enrollmentAppointment.setExaminerExamEvent(newExaminerExamEvent);

    enrollmentAppointmentRepository.flush();

    return ClerkEnrollmentUtil.createClerkEnrollmentAppointmentDTO(enrollmentAppointment, baseUrlAPI);
  }

  @Transactional
  public ExaminerOnrBirthdateDTO createPersonForAppointment(
    final String oid,
    final long enrollmentAppointmentId,
    final ExaminerEnrollmentBirthdateOrSsnDTO dto
  ) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentAppointmentId
    );

    checkExaminerOid(enrollmentAppointment, oid);

    if (enrollmentAppointment.getPaymentLinkHash() == null || enrollmentAppointment.getPaymentLinkHash().isEmpty()) {
      enrollmentAppointment.setPaymentLinkHash(uuidSource.getRandomNonce());
      enrollmentAppointmentRepository.saveAndFlush(enrollmentAppointment);
    }

    Person person;
    String personOid;
    if (enrollmentAppointment.getPerson() != null) {
      person = enrollmentAppointment.getPerson();
    } else {
      person = new Person();
      person.setFirstName(enrollmentAppointment.getFirstName());
      person.setLastName(enrollmentAppointment.getLastName());
      person.setLatestIdentifiedAt(LocalDateTime.now());
      person.setLatestSyncAt(LocalDateTime.now());
      person.setUuid(UUID.randomUUID());

      person = personRepository.saveAndFlush(person);

      enrollmentAppointment.setPerson(person);
      enrollmentAppointmentRepository.saveAndFlush(enrollmentAppointment);
    }

    if (person.getOid() == null || person.getOid().isEmpty()) {
      if (HetuUtils.hetuIsValid(dto.birthdateOrSsn())) {
        person.setOtherIdentifier(dto.birthdateOrSsn());
        personOid = onrService.insertPersonalData(person, null);
      } else {
        try {
          final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d.M.yyyy");
          final LocalDate birthdate = LocalDate.parse(dto.birthdateOrSsn(), formatter);

          personOid = onrService.insertPersonalData(person, DateUtil.formatOptionalDate(birthdate));
        } catch (final DateTimeParseException e) {
          throw new APIException(APIExceptionType.INVALID_BIRTHDATE_FORMAT);
        }
      }

      if (personOid != null && personOid.length() > 0) {
        person.setOid(personOid);
        person.setLatestSyncAt(LocalDateTime.now());
        personRepository.saveAndFlush(person);
      }
    } else {
      personOid = person.getOid();
    }

    final String birthdate = HetuUtils.hetuIsValid(dto.birthdateOrSsn())
      ? DateUtil.formatBirthdateFromSSN(dto.birthdateOrSsn())
      : dto.birthdateOrSsn();

    return ExaminerOnrBirthdateDTO.builder().birthdate(birthdate).oid(personOid).build();
  }
}
