package fi.oph.vkt.service;

import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PersonRepository;
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

  public Person getPersonByHash(final String personHash) {
    return personRepository
      .findByPaymentLinkHash(personHash)
      .orElseThrow(() -> new NotFoundException("Person not found"));
  }
}
