package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.clerk.ClerkOnrSsnDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.onr.OnrService;
import fi.oph.vkt.service.onr.PersonalData;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkPersonService {

  private final PersonRepository personRepository;
  private final OnrService onrService;
  private final AuditService auditService;

  private static final Logger LOG = LoggerFactory.getLogger(ClerkPersonService.class);

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void deleteObsoletePersons() {
    // A suitable time for us to expect anyone enrolling to queue to either finish enrolling or quit
    final Duration ttl = Duration.of(24, ChronoUnit.HOURS);

    personRepository
      .findObsoletePersons(LocalDateTime.now().minus(ttl))
      .forEach(person -> personRepository.deleteById(person.getId()));
  }

  public ClerkOnrSsnDTO getOnrSsn(final String oid) {
    final Person person = personRepository.findByOid(oid).orElseThrow();
    if (person.getDeletedAt() != null) {
      LOG.error("Trying to access deleted person with oid {}", oid);
    }

    auditService.logById(VktOperation.GET_SSN_BY_OID, oid);

    final PersonalData onrData = onrService.getOnrPersonalData(oid);

    if (onrData == null || onrData.getSsn() == null || onrData.getSsn().isEmpty()) {
      return null;
    }

    return ClerkOnrSsnDTO.builder().ssn(onrData.getSsn()).oid(oid).build();
  }
}
