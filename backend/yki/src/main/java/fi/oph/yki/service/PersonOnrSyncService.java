package fi.oph.yki.service;

import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PersonOnrSyncService {

  private final PersonRepository personRepository;

  @Transactional
  public void saveBatch(final Map<String, PersonalDataDTO> onrPersons) {
    // The key is the OID that was asked for. The person is the master person, and its own OID is
    // another one when the OID asked for is a linked duplicate.
    onrPersons.forEach((oid, person) ->
      personRepository.updateIndividualised(
        oid,
        // As legacy (or yksiloity yksiloityVTJ): NULL when yksiloity is not true and yksiloityVTJ is
        // missing. The selection then does not pick the person again, as in legacy.
        Boolean.TRUE.equals(person.getIndividualised()) ? Boolean.TRUE : person.getIndividualisedVtj()
      )
    );
  }
}
