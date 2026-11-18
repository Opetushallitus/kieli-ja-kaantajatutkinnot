package fi.oph.yki.service;

import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonRepository;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PersonOnrSyncService {

  private final PersonRepository personRepository;

  /**
   * Call only with an answer from ONR. Every OID that was asked for is saved as checked; an OID that
   * the answer does not have is saved without a status, so it is checked again with the persons who
   * are not individualised.
   */
  @Transactional
  public void saveBatch(final List<String> oids, final Map<String, PersonalDataDTO> onrPersons) {
    // The key is the OID that was asked for. The person is the master person, and its own OID is
    // another one when the OID asked for is a linked duplicate.
    oids.forEach(oid -> {
      final PersonalDataDTO person = onrPersons.get(oid);
      personRepository.updateIndividualised(
        oid,
        // As legacy (or yksiloity yksiloityVTJ): NULL when yksiloity is not true and yksiloityVTJ is
        // missing.
        person == null
          ? null
          : Boolean.TRUE.equals(person.getIndividualised()) ? Boolean.TRUE : person.getIndividualisedVtj()
      );
    });
  }
}
