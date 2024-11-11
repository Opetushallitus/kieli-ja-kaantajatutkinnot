package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.examiner.ExaminerExamEventDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.repository.ExaminerExamEventRepository;
import fi.oph.vkt.util.ExaminerUtil;
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

  @Transactional(readOnly = true)
  public ExaminerExamEventDTO getExamEvent(final long examEventId) {
    final ExaminerExamEventDTO examEventDTO = getExamEventWithoutAudit(examEventId);

    auditService.logById(VktOperation.GET_EXAM_EVENT, examEventId);
    return examEventDTO;
  }

  private ExaminerExamEventDTO getExamEventWithoutAudit(final long examEventId) {
    final ExaminerExamEvent examEvent = examinerExamEventRepository.getReferenceById(examEventId);
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    return ExaminerUtil.toExaminerExamEventDTO(examEvent, baseUrlAPI);
  }
}
