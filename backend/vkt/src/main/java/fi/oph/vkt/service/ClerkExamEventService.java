package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventCreateDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventDTOCommonFields;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventUpdateDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.audit.dto.ClerkExamEventAuditDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.repository.ClerkExamEventProjection;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import fi.oph.vkt.util.ExamEventUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.DataIntegrityViolationExceptionUtil;
import fi.oph.vkt.view.ExamEventXlsxData;
import fi.oph.vkt.view.ExamEventXlsxDataRowUtil;
import fi.oph.vkt.view.ExamEventXlsxView;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@Service
@RequiredArgsConstructor
public class ClerkExamEventService {

  private final ExamEventRepository examEventRepository;
  private final EnrollmentRepository enrollmentRepository;
  private final AuditService auditService;

  @Transactional(readOnly = true)
  public List<ClerkExamEventListDTO> list() {
    final List<ClerkExamEventProjection> examEventProjections = examEventRepository.listClerkExamEventProjections();
    final Set<Long> examEventIdsHavingQueue = examEventRepository.listClertExamEventIdsWithQueue();

    final List<ClerkExamEventListDTO> examEventListDTOs = examEventProjections
      .stream()
      .map(e -> {
        final boolean isFreeSeats = e.maxParticipants() - e.participants() > 0;
        final boolean isUnusedSeats = examEventIdsHavingQueue.contains(e.id()) && isFreeSeats ? true : false;

        return ClerkExamEventListDTO
          .builder()
          .id(e.id())
          .language(e.language())
          .level(e.level())
          .date(e.date())
          .registrationCloses(e.registrationCloses())
          .participants(e.participants())
          .maxParticipants(e.maxParticipants())
          .isUnusedSeats(isUnusedSeats)
          .isHidden(e.isHidden())
          .unApprovedFreeEnrollments(e.unApprovedFreeEnrollments())
          .build();
      })
      .sorted(Comparator.comparing(ClerkExamEventListDTO::date).thenComparing(ClerkExamEventListDTO::language))
      .toList();

    auditService.logOperation(VktOperation.LIST_EXAM_EVENTS);
    return examEventListDTOs;
  }

  @Transactional(readOnly = true)
  public ClerkExamEventDTO getExamEvent(final long examEventId) {
    final ClerkExamEventDTO examEventDTO = getExamEventWithoutAudit(examEventId);

    auditService.logById(VktOperation.GET_EXAM_EVENT, examEventId);
    return examEventDTO;
  }

  private ClerkExamEventDTO getExamEventWithoutAudit(final long examEventId) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final List<Enrollment> enrollments = examEvent.getEnrollments();

    final Map<Long, FreeEnrollmentDetails> freeEnrollmentDetails = enrollments
      .stream()
      .collect(
        Collectors.toMap(
          enrollment -> enrollment.getPerson().getId(),
          enrollment -> enrollmentRepository.countEnrollmentsByPerson(enrollment.getPerson())
        )
      );

    final List<ClerkEnrollmentDTO> enrollmentDTOs = enrollments
      .stream()
      .map(e -> ClerkEnrollmentUtil.createClerkEnrollmentDTO(e, freeEnrollmentDetails.get(e.getPerson().getId())))
      .toList();

    return ClerkExamEventDTO
      .builder()
      .id(examEvent.getId())
      .version(examEvent.getVersion())
      .language(examEvent.getLanguage())
      .level(examEvent.getLevel())
      .date(examEvent.getDate())
      .registrationCloses(examEvent.getRegistrationCloses())
      .isHidden(examEvent.isHidden())
      .maxParticipants(examEvent.getMaxParticipants())
      .enrollments(enrollmentDTOs)
      .build();
  }

  @Transactional
  public ClerkExamEventDTO createExamEvent(final ClerkExamEventCreateDTO dto) {
    final ExamEvent examEvent = new ExamEvent();

    copyDtoFieldsToExamEvent(dto, examEvent);

    try {
      examEventRepository.saveAndFlush(examEvent);
    } catch (final DataIntegrityViolationException ex) {
      if (DataIntegrityViolationExceptionUtil.isExamEventLanguageLevelDateUniquenessException(ex)) {
        throw new APIException(APIExceptionType.EXAM_EVENT_DUPLICATE);
      }
      throw ex;
    }

    final ClerkExamEventAuditDTO auditDto = ExamEventUtil.createExamEventAuditDTO(examEvent);
    auditService.logCreate(VktOperation.CREATE_EXAM_EVENT, examEvent.getId(), auditDto);
    return getExamEventWithoutAudit(examEvent.getId());
  }

  @Transactional
  public ClerkExamEventDTO updateExamEvent(final ClerkExamEventUpdateDTO dto) {
    final Long id = dto.id();
    final ExamEvent examEvent = examEventRepository.getReferenceById(id);
    final ClerkExamEventAuditDTO oldAuditDto = ExamEventUtil.createExamEventAuditDTO(examEvent);

    examEvent.assertVersion(dto.version());

    copyDtoFieldsToExamEvent(dto, examEvent);
    try {
      examEventRepository.flush();
    } catch (final DataIntegrityViolationException ex) {
      if (DataIntegrityViolationExceptionUtil.isExamEventLanguageLevelDateUniquenessException(ex)) {
        throw new APIException(APIExceptionType.EXAM_EVENT_DUPLICATE);
      }
      throw ex;
    }

    final ClerkExamEventAuditDTO newAuditDto = ExamEventUtil.createExamEventAuditDTO(examEvent);
    auditService.logUpdate(VktOperation.UPDATE_EXAM_EVENT, id, oldAuditDto, newAuditDto);

    return getExamEventWithoutAudit(id);
  }

  private void copyDtoFieldsToExamEvent(final ClerkExamEventDTOCommonFields dto, final ExamEvent examEvent) {
    examEvent.setLanguage(dto.language());
    examEvent.setLevel(dto.level());
    examEvent.setDate(dto.date());
    examEvent.setRegistrationCloses(dto.registrationCloses());
    examEvent.setHidden(dto.isHidden());
    examEvent.setMaxParticipants(dto.maxParticipants());
  }

  @Transactional(readOnly = true)
  public AbstractXlsxView getExamEventExcel(final long examEventId) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final List<Enrollment> enrollments = examEvent
      .getEnrollments()
      .stream()
      .sorted(excelEnrollmentComparator())
      .toList();

    final ExamEventXlsxData excelData = ExamEventXlsxDataRowUtil.createExcelData(examEvent, enrollments);
    final AbstractXlsxView excel = new ExamEventXlsxView(excelData);

    auditService.logById(VktOperation.GET_EXAM_EVENT_EXCEL, examEventId);
    return excel;
  }

  private static Comparator<Enrollment> excelEnrollmentComparator() {
    final Comparator<Enrollment> byStatus = Comparator.comparing(Enrollment::getStatus);
    final Comparator<Enrollment> byCreatedAt = Comparator.comparing(Enrollment::getCreatedAt);
    return byStatus.thenComparing(byCreatedAt);
  }
}
