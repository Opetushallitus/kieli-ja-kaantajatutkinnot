package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.util.PersonUtil;
import fi.oph.vkt.util.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PublicPersonService {

  private final PersonRepository personRepository;

  public Person getPerson(final Long personId) {
    return personRepository.findById(personId).orElseThrow(() -> new NotFoundException("Person not found"));
  }

  public PublicPersonDTO getPersonDTO(final Person person) {
    return PersonUtil.createPublicPersonDTO(person);
  }
}
