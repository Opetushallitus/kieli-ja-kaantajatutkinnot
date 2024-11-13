package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.MunicipalityDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventUpsertDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Municipality;
import fi.oph.vkt.repository.ExaminerExamEventRepository;
import fi.oph.vkt.repository.ExaminerRepository;
import fi.oph.vkt.util.ExaminerUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExaminerExamEventService {

  private final ExaminerExamEventRepository examinerExamEventRepository;
  private final Environment environment;

  private final AuditService auditService;
  private final ExaminerRepository examinerRepository;
  private final MunicipalityService municipalityService;

  @Transactional(readOnly = true)
  public ExaminerExamEventDTO getExamEvent(final String oid, final long examEventId) {
    final ExaminerExamEventDTO examEventDTO = getExamEventWithoutAudit(oid, examEventId);

    auditService.logById(VktOperation.GET_EXAM_EVENT, examEventId);
    return examEventDTO;
  }

  private ExaminerExamEventDTO getExamEventWithoutAudit(final String oid, final long examEventId) {
    final Optional<ExaminerExamEvent> result = examinerExamEventRepository.findByOidAndExaminerExamEventId(
      oid,
      examEventId
    );
    if (result.isEmpty()) {
      throw new APIException(APIExceptionType.EXAMINER_EXAM_EVENT_NOT_FOUND);
    } else {
      final ExaminerExamEvent examEvent = result.get();
      final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

      return ExaminerUtil.toExaminerExamEventDTO(examEvent, baseUrlAPI);
    }
  }

  private Municipality getExaminerMunicipalityOrThrow(Examiner examiner, MunicipalityDTO municipalityDTO) {
    return examiner
      .getMunicipalities()
      .stream()
      .filter(m -> m.getCode().equals(municipalityDTO.code()))
      .findFirst()
      .orElseThrow(() -> new APIException(APIExceptionType.EXAMINER_MUNICIPALITY_MISMATCH));
  }

  @Transactional
  public ExaminerExamEventDTO createExamEvent(final String oid, final ExaminerExamEventUpsertDTO dto) {
    Examiner examiner = examinerRepository
      .findByOid(oid)
      .orElseThrow(() -> new APIException(APIExceptionType.EXAMINER_NOT_FOUND));
    ExaminerExamEvent examEvent = new ExaminerExamEvent();
    examEvent.setExaminer(examiner);
    examEvent.setDate(dto.date());
    examEvent.setLanguage(dto.language());
    examEvent.setMunicipality(getExaminerMunicipalityOrThrow(examiner, dto.municipality()));
    examEvent.setHidden(dto.isHidden());
    examEvent.setExamTime(dto.examTime());
    examEvent.setLocation(dto.location());
    examEvent.setOtherInformation(dto.otherInformation());
    examEvent.setMaxParticipants(dto.maxParticipants());
    examEvent.setRegistrationCloses(dto.registrationCloses());

    ExaminerExamEvent examinerExamEvent = examinerExamEventRepository.saveAndFlush(examEvent);
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");
    return ExaminerUtil.toExaminerExamEventDTO(examinerExamEvent, baseUrlAPI);
  }
}
