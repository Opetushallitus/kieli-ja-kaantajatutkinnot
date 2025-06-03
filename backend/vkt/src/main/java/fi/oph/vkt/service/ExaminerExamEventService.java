package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.MunicipalityDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventUpsertDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Municipality;
import fi.oph.vkt.repository.ExaminerExamEventRepository;
import fi.oph.vkt.repository.ExaminerRepository;
import fi.oph.vkt.service.onr.OnrService;
import fi.oph.vkt.service.onr.PersonalData;
import fi.oph.vkt.util.ExamEventUtil;
import fi.oph.vkt.util.ExaminerUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.view.ExamEventXlsxData;
import fi.oph.vkt.view.ExamEventXlsxDataRowUtil;
import fi.oph.vkt.view.ExamEventXlsxView;
import fi.oph.vkt.view.ExaminerExamEventXlsxData;
import fi.oph.vkt.view.ExaminerExamEventXlsxView;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@Service
@RequiredArgsConstructor
public class ExaminerExamEventService {

  private final ExaminerExamEventRepository examinerExamEventRepository;
  private final Environment environment;
  private final OnrService onrService;
  private final AuditService auditService;
  private final ExaminerRepository examinerRepository;

  @Transactional(readOnly = true)
  public ExaminerExamEventDTO getExamEvent(final String oid, final long examEventId) {
    final ExaminerExamEventDTO examEventDTO = getExamEventWithoutAudit(oid, examEventId);

    auditService.logById(VktOperation.GET_EXAM_EVENT, examEventId);
    return examEventDTO;
  }

  private ExaminerExamEvent getExamEventForExaminer(final String oid, final long examEventId) {
    ExaminerExamEvent examinerExamEvent = examinerExamEventRepository
      .findById(examEventId)
      .orElseThrow(() -> new APIException(APIExceptionType.EXAMINER_EXAM_EVENT_NOT_FOUND));
    Examiner examiner = examinerExamEvent.getExaminer();
    if (!examiner.getOid().equals(oid)) {
      throw new APIException(APIExceptionType.EXAMINER_EXAM_EVENT_EXAMINER_MISMATCH);
    }
    return examinerExamEvent;
  }

  private ExaminerExamEventDTO getExamEventWithoutAudit(final String oid, final long examEventId) {
    ExaminerExamEvent examEvent = getExamEventForExaminer(oid, examEventId);
    Examiner examiner = examEvent.getExaminer();
    if (!examiner.getOid().equals(oid)) {
      throw new APIException(APIExceptionType.EXAMINER_EXAM_EVENT_EXAMINER_MISMATCH);
    }
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    return ExaminerUtil.toExaminerExamEventDTO(examEvent, baseUrlAPI);
  }

  private Municipality getExaminerMunicipalityOrThrow(Examiner examiner, MunicipalityDTO municipalityDTO) {
    return examiner
      .getMunicipalities()
      .stream()
      .filter(m -> m.getCode().equals(municipalityDTO.code()))
      .findFirst()
      .orElseThrow(() -> new APIException(APIExceptionType.EXAMINER_MUNICIPALITY_MISMATCH));
  }

  private void updateExamEventDetails(Examiner examiner, ExaminerExamEvent examEvent, ExaminerExamEventUpsertDTO dto) {
    examEvent.setDate(dto.date());
    examEvent.setLanguage(dto.language());
    examEvent.setMunicipality(getExaminerMunicipalityOrThrow(examiner, dto.municipality()));
    examEvent.setHidden(dto.isHidden());
    examEvent.setExamTime(dto.examTime());
    examEvent.setLocation(dto.location());
    examEvent.setOtherInformation(dto.otherInformation());
    examEvent.setMaxParticipants(dto.maxParticipants());
    examEvent.setRegistrationCloses(dto.registrationCloses());
  }

  @Transactional
  public ExaminerExamEventDTO createExamEvent(final String oid, final ExaminerExamEventUpsertDTO dto) {
    final Examiner examiner = examinerRepository
      .findByOid(oid)
      .orElseThrow(() -> new APIException(APIExceptionType.EXAMINER_NOT_FOUND));
    final ExaminerExamEvent examEvent = new ExaminerExamEvent();
    examEvent.setExaminer(examiner);
    updateExamEventDetails(examiner, examEvent, dto);

    final ExaminerExamEvent examinerExamEvent = examinerExamEventRepository.saveAndFlush(examEvent);
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");
    return ExaminerUtil.toExaminerExamEventDTO(examinerExamEvent, baseUrlAPI);
  }

  @Transactional
  public ExaminerExamEventDTO updateExamEvent(
    final String oid,
    final Long examEventId,
    final ExaminerExamEventUpsertDTO dto
  ) {
    ExaminerExamEvent examEvent = getExamEventForExaminer(oid, examEventId);
    updateExamEventDetails(examEvent.getExaminer(), examEvent, dto);
    ExaminerExamEvent examinerExamEvent = examinerExamEventRepository.saveAndFlush(examEvent);
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");
    return ExaminerUtil.toExaminerExamEventDTO(examinerExamEvent, baseUrlAPI);
  }

  @Transactional(readOnly = true)
  public List<ExaminerExamEventDTO> list(final String oid) {
    final Examiner examiner = examinerRepository
      .findByOid(oid)
      .orElseThrow(() -> new APIException(APIExceptionType.EXAMINER_NOT_FOUND));
    final List<ExaminerExamEvent> examinerExamEvents = examinerExamEventRepository.findAllByExaminer(examiner);

    return examinerExamEvents
      .stream()
      .filter(e ->
        (e.getLocation() != null && !e.getLocation().isBlank()) &&
        (e.getExamTime() != null && !e.getExamTime().isBlank())
      )
      .map(ExaminerUtil::toExaminerExamEventWithoutEnrollmentsDTO)
      .toList();
  }

  @Transactional(readOnly = true)
  public AbstractXlsxView getExamEventExcel(final String oid, final long examEventId) {
    final ExaminerExamEvent examEvent = examinerExamEventRepository.getReferenceById(examEventId);

    if (!examEvent.getExaminer().getOid().equals(oid)) {
      throw new APIException(APIExceptionType.EXAMINER_EXAM_EVENT_EXAMINER_MISMATCH);
    }

    final List<EnrollmentAppointment> enrollments = examEvent
      .getEnrollments()
      .stream()
      .sorted(excelEnrollmentComparator())
      .toList();

    final List<String> onrIds = ExamEventUtil.getOnrIds(enrollments);
    final Map<String, PersonalData> personalDatas = onrService.getOnrPersonalData(onrIds);
    final ExaminerExamEventXlsxData excelData = ExamEventXlsxDataRowUtil.createExcelData(
      examEvent,
      enrollments,
      personalDatas
    );
    final AbstractXlsxView excel = new ExaminerExamEventXlsxView(excelData);

    auditService.logById(VktOperation.GET_EXAM_EVENT_EXCEL, examEventId);
    return excel;
  }

  private static Comparator<EnrollmentAppointment> excelEnrollmentComparator() {
    final Comparator<EnrollmentAppointment> byStatus = Comparator.comparing(EnrollmentAppointment::getStatus);
    final Comparator<EnrollmentAppointment> byCreatedAt = Comparator.comparing(EnrollmentAppointment::getCreatedAt);
    return byStatus.thenComparing(byCreatedAt);
  }
}
