package fi.oph.vkt.service;

import fi.oph.vkt.repository.PersonRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkPersonService {

  private final PersonRepository personRepository;

  @Transactional(isolation = Isolation.SERIALIZABLE)
  public void deleteObsoletePersons() {
    // A suitable time for us to expect anyone enrolling to queue to either finish enrolling or quit
    final Duration ttl = Duration.of(24, ChronoUnit.HOURS);

    personRepository
      .findObsoletePersons(LocalDateTime.now().minus(ttl))
      .forEach(person -> personRepository.deleteById(person.getId()));
  }
}
