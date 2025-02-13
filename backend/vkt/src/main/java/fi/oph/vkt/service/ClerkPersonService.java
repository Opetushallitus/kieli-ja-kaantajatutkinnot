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
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkPersonService {

  private final PersonRepository personRepository;
  private final OnrService onrService;
  private final AuditService auditService;

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
    final String personOid = person.getOid();
    auditService.logById(VktOperation.GET_SSN_BY_OID, oid);

    if (personOid == null) {
      return null;
    }

    final Map<String, PersonalData> personalData = onrService.getOnrPersonalData(List.of(personOid));
    final PersonalData onrData = personalData.get(personOid);

    if (onrData == null || onrData.getSsn() == null || onrData.getSsn().isEmpty()) {
      return null;
    }

    return ClerkOnrSsnDTO.builder().ssn(onrData.getSsn()).oid(personOid).build();
  }
}
