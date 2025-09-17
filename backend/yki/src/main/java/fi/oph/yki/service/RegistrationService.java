package fi.oph.yki.service;

import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RegistrationService {

  private final RegistrationRepository registrationRepository;
  private final PersonRepository personRepository;

  public Registration findRegistration(final Long registrationId, final String oid) {
    final Person person = personRepository.getByOid(oid);
    final Registration registration = registrationRepository.getReferenceById(registrationId);

    return registration;
  }
}
