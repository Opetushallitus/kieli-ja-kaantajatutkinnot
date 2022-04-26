package fi.oph.akt.service;

import fi.oph.akt.api.dto.clerk.ExaminationDateDTO;
import fi.oph.akt.audit.AuditService;
import fi.oph.akt.model.ExaminationDate;
import fi.oph.akt.repository.ExaminationDateRepository;
import java.util.List;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExaminationDateService {

  @Resource
  private final ExaminationDateRepository examinationDateRepository;

  @Resource
  private final AuditService auditService;

  @Transactional(readOnly = true)
  public List<ExaminationDateDTO> listExaminationDatesWithoutAudit() {
    return examinationDateRepository.findAllByOrderByDateDesc().stream().map(this::toDTO).toList();
  }

  private ExaminationDateDTO toDTO(final ExaminationDate examinationDate) {
    return ExaminationDateDTO
      .builder()
      .id(examinationDate.getId())
      .version(examinationDate.getVersion())
      .date(examinationDate.getDate())
      .build();
  }
}
