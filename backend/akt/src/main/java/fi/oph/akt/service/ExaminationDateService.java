package fi.oph.akt.service;

import fi.oph.akt.api.dto.clerk.ExaminationDateDTO;
import fi.oph.akt.api.dto.clerk.modify.ExaminationDateCreateDTO;
import fi.oph.akt.audit.AktOperation;
import fi.oph.akt.audit.AuditService;
import fi.oph.akt.model.ExaminationDate;
import fi.oph.akt.repository.ExaminationDateRepository;
import fi.oph.akt.util.exception.APIException;
import fi.oph.akt.util.exception.APIExceptionType;
import java.util.List;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
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

  @Transactional
  public ExaminationDateDTO createExaminationDate(final ExaminationDateCreateDTO dto) {
    final ExaminationDate examinationDate = new ExaminationDate();
    examinationDate.setDate(dto.date());

    try {
      examinationDateRepository.saveAndFlush(examinationDate);
    } catch (DataIntegrityViolationException ex) {
      throw new APIException(APIExceptionType.EXAMINATION_DATE_CREATE_DUPLICATE_DATE);
    }

    final ExaminationDateDTO result = toDTO(examinationDate);
    auditService.logById(AktOperation.CREATE_EXAMINATION_DATE, examinationDate.getId());
    return result;
  }

  @Transactional
  public void deleteExaminationDate(final long examinationDateId) {
    final ExaminationDate examinationDate = examinationDateRepository.getById(examinationDateId);

    if (!examinationDate.getAuthorisations().isEmpty()) {
      throw new APIException(APIExceptionType.EXAMINATION_DATE_DELETE_HAS_AUTHORISATIONS);
    }
    examinationDateRepository.deleteAllByIdInBatch(List.of(examinationDateId));

    auditService.logById(AktOperation.DELETE_EXAMINATION_DATE, examinationDateId);
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
