package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.examiner.ExaminerOnrBirthdateDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.ExaminerRepository;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.onr.OnrService;
import fi.oph.vkt.service.onr.PersonalData;
import fi.oph.vkt.util.DateUtil;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExaminerPersonService {

  private final PersonRepository personRepository;
  private final ExaminerRepository examinerRepository;
  private final OnrService onrService;
  private final AuditService auditService;

  private static final Logger LOG = LoggerFactory.getLogger(ExaminerPersonService.class);

  public ExaminerOnrBirthdateDTO getOnrBirthdate(@NotNull final String oid, final String examinerOid) {
    final Person person = personRepository.findByOid(oid).orElseThrow();
    final Examiner examiner = examinerRepository.findByOid(examinerOid).orElseThrow();
    if (person.getDeletedAt() != null) {
      LOG.error("Trying to access deleted person with oid {}", oid);

      return null;
    }
    if (examiner.getDeletedAt() != null) {
      LOG.error("Trying to access deleted examiner with oid {}", examinerOid);

      return null;
    }

    final boolean exists = personRepository.existsForExaminer(person, examiner);
    if (!exists) {
      LOG.error("Person with oid {} has no enrollment for examiner {}", oid, examinerOid);

      return null;
    }

    auditService.logById(VktOperation.GET_BIRTHDATE_BY_OID, oid);

    final PersonalData onrData = onrService.getOnrPersonalData(oid);

    if (onrData == null || onrData.getSsn() == null || onrData.getSsn().isEmpty()) {
      return null;
    }

    final String birthdate = DateUtil.formatBirthdateFromSSN(onrData.getSsn());

    return ExaminerOnrBirthdateDTO.builder().birthdate(birthdate).oid(oid).build();
  }
}
