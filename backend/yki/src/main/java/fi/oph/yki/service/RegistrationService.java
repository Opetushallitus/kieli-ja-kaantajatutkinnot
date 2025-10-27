package fi.oph.yki.service;

import fi.oph.yki.api.dto.PublicEducationDTO;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.model.type.FreeRegistrationType;
import fi.oph.yki.repository.FreeRegistrationRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.koski.KoskiService;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class RegistrationService {

  private final RegistrationRepository registrationRepository;
  private final FreeRegistrationRepository freeRegistrationRepository;
  private final PersonRepository personRepository;

  @Resource
  private KoskiService koskiService;

  @Transactional(readOnly = true)
  public Registration findRegistration(final Long registrationId, final String oid) {
    final Person person = personRepository.getByOid(oid);
    final Registration registration = registrationRepository.getReferenceById(registrationId);

    if (person == null || registration.getPerson() == null || !oid.equals(registration.getPerson().getOid())) {
      throw new APIException(APIExceptionType.PERSON_REGISTRATION_OID_MISMATCH);
    }

    return registration;
  }

  @Transactional
  public List<PublicEducationDTO> updateEducations(final Registration registration) {
    final List<PublicEducationDTO> educationDTOs = koskiService.getEducations(registration);
    final FreeRegistration freeRegistration = registration.getFreeRegistration() == null
      ? new FreeRegistration()
      : registration.getFreeRegistration();

    final Set<FreeRegistrationType> freeEnrollmentTypes = educationDTOs
      .stream()
      .map(FreeRegistrationType::fromEducationDTO)
      .collect(Collectors.toSet());

    freeRegistration.setRegistration(registration);
    freeRegistration.setSource(FreeRegistrationSource.KOSKI);
    freeRegistration.setType(FreeRegistrationType.HigherEducationEnrolled);
    freeRegistration.setMatriculationExam(freeEnrollmentTypes.contains(FreeRegistrationType.MatriculationExam));
    freeRegistration.setHigherEducationConcluded(
      freeEnrollmentTypes.contains(FreeRegistrationType.HigherEducationConcluded)
    );
    freeRegistration.setHigherEducationEnrolled(
      freeEnrollmentTypes.contains(FreeRegistrationType.HigherEducationEnrolled)
    );
    freeRegistration.setDia(freeEnrollmentTypes.contains(FreeRegistrationType.DIA));
    freeRegistration.setEb(freeEnrollmentTypes.contains(FreeRegistrationType.EB));
    freeRegistration.setOther(freeEnrollmentTypes.contains(FreeRegistrationType.Other));

    final FreeRegistration freeRegistrationUpdated = freeRegistrationRepository.saveAndFlush(freeRegistration);
    registration.setFreeRegistration(freeRegistrationUpdated);

    return educationDTOs;
  }
}
