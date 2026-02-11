package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkPersonContactUpdateDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.model.Person;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.util.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PersonService {

  private final PersonRepository personRepository;

  @Transactional
  public void updateContactDetails(final String oid, final ClerkPersonContactUpdateDTO dto) {

    final Person person = personRepository.getByOid(oid);
    if (person == null) {
      throw new NotFoundException(String.format("Person not found with oid: %s", oid));
    }

    person.setEmail(dto.email());
    person.setPhoneNumber(dto.phoneNumber());
    person.setSteetAddress(dto.streetAddress());
    person.setPostOffice(dto.postOffice());
    person.setZip(dto.zip());
    personRepository.saveAndFlush(person);
  }
}
