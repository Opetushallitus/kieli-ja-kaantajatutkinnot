package fi.oph.vkt.service;

import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PersonRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PublicPersonService {

  private final PersonRepository personRepository;

  public Person getPerson(final Long personId) {
    return personRepository.findById(personId).orElseThrow(() -> new NotFoundException("Person not found"));
  }
}
