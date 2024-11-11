package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.examiner.ExaminerDetailsDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.repository.ExaminerRepository;
import fi.oph.vkt.util.ExaminerUtil;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkExaminerService {

  private final ExaminerRepository examinerRepository;
  private final AuditService auditService;
  private final Environment environment;

  @Transactional(readOnly = true)
  public List<ExaminerDetailsDTO> listExaminers() {
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    // TODO Audit log entry
    return examinerRepository
      .getAllByDeletedAtIsNull()
      .stream()
      .map(e -> ExaminerUtil.toExaminerDetailsDTO(e, List.of(), baseUrlAPI))
      .collect(Collectors.toList());
  }
}
