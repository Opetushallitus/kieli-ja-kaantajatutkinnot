package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.service.onr.OnrService;
import fi.oph.vkt.service.onr.PersonalData;
import fi.oph.vkt.util.HetuUtils;
import fi.oph.vkt.util.PersonUtil;
import fi.oph.vkt.util.exception.NotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicPersonService {

  private final PersonRepository personRepository;
  private final OnrService onrService;

  private static final Logger LOG = LoggerFactory.getLogger(PublicPersonService.class);

  @Transactional(readOnly = true)
  public Person getPerson(final Long personId) {
    return personRepository.findById(personId).orElseThrow(() -> new NotFoundException("Person not found"));
  }

  public PublicPersonDTO getPersonDTO(final Person person) {
    return PersonUtil.createPublicPersonDTO(person);
  }

  // Don't rollback in case of error since data is already saved to ONR
  @Transactional(propagation = Propagation.NEVER)
  public void syncPersonOidData() {
    final List<Person> personsMissingOid = personRepository.findByOidIsNullAndDeletedAtIsNull();
    personsMissingOid.forEach(person -> {
      try {
        if (!HetuUtils.hetuIsValid(person.getOtherIdentifier())) {
          LOG.warn("Trying to insert personal data to ONR with invalid SSN for person {}", person.getId());

          return;
        }

        final String oid = onrService.insertPersonalData(person, null);
        if (oid != null && oid.length() > 0) {
          person.setOid(oid);
          person.setLatestSyncAt(LocalDateTime.now());
          personRepository.saveAndFlush(person);
        }
      } catch (final Exception e) {
        LOG.error("Inserting personal data to ONR failed for person {}", person.getId());
      }
    });
  }

  @Transactional
  public void syncPersonNameData() {
    final List<String> onrIds = personRepository.findPersonsToSync(LocalDateTime.now().minusDays(1));

    final Map<String, PersonalData> oidToPersonalData = onrService.getOnrPersonalData(onrIds);
    oidToPersonalData.forEach((oid, personalData) -> {
      final Person person = personRepository.getByOid(oid);
      person.setTmpFirstName(personalData.getFirstName());
      person.setTmpLastName(personalData.getLastName());
      person.setTmpNickname(personalData.getNickname());
      person.setLatestSyncAt(LocalDateTime.now());
      personRepository.saveAndFlush(person);
    });
  }
}
