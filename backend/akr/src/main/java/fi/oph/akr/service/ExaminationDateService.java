package fi.oph.akr.service;

import fi.oph.akr.api.dto.clerk.ExaminationDateDTO;
import fi.oph.akr.api.dto.clerk.modify.ExaminationDateCreateDTO;
import fi.oph.akr.audit.AkrOperation;
import fi.oph.akr.audit.AuditService;
import fi.oph.akr.model.ExaminationDate;
import fi.oph.akr.repository.ExaminationDateRepository;
import fi.oph.akr.util.exception.APIException;
import fi.oph.akr.util.exception.APIExceptionType;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExaminationDateService {

  private final ExaminationDateRepository examinationDateRepository;
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
    } catch (final DataIntegrityViolationException ex) {
      throw new APIException(APIExceptionType.EXAMINATION_DATE_CREATE_DUPLICATE_DATE);
    }

    final ExaminationDateDTO result = toDTO(examinationDate);
    auditService.logById(AkrOperation.CREATE_EXAMINATION_DATE, examinationDate.getId());
    return result;
  }

  @Transactional
  public void deleteExaminationDate(final long examinationDateId) {
    final ExaminationDate examinationDate = examinationDateRepository.getReferenceById(examinationDateId);

    if (!examinationDate.getAuthorisations().isEmpty()) {
      throw new APIException(APIExceptionType.EXAMINATION_DATE_DELETE_HAS_AUTHORISATIONS);
    }
    examinationDateRepository.deleteById(examinationDateId);

    auditService.logById(AkrOperation.DELETE_EXAMINATION_DATE, examinationDateId);
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
