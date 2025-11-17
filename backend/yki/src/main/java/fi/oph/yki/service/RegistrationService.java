package fi.oph.yki.service;

import fi.oph.yki.api.dto.*;
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
    // TODO Person may not exist at this point?
    final Person person = personRepository.getByOid(oid);
    final Registration registration = registrationRepository.getReferenceById(registrationId);

    if (person == null || registration.getPerson() == null || !oid.equals(registration.getPerson().getOid())) {
      throw new APIException(APIExceptionType.PERSON_REGISTRATION_OID_MISMATCH);
    }

    return registration;
  }

  private static FreeRegistrationType getFreeRegistrationType(final FreeRegistration freeRegistration) {
    if (freeRegistration.getMatriculationExam()) {
      return FreeRegistrationType.MatriculationExam;
    } else if (freeRegistration.getDia()) {
      return FreeRegistrationType.DIA;
    } else if (freeRegistration.getEb()) {
      return FreeRegistrationType.EB;
    } else if (freeRegistration.getHigherEducationConcluded()) {
      return FreeRegistrationType.HigherEducationConcluded;
    } else if (freeRegistration.getHigherEducationEnrolled()) {
      return FreeRegistrationType.HigherEducationEnrolled;
    } else {
      return FreeRegistrationType.Other;
    }
  }

  @Transactional
  public PublicFreeRegistrationDTO updateFreeRegistration(
    final Registration registration,
    final PublicEducationUpdateDTO educationUpdateDTO
  ) {
    PublicEducationBasisDTO basis = educationUpdateDTO.basis();
    FreeRegistrationSource source = basis.source();
    final FreeRegistration freeRegistration = registration.getFreeRegistration() == null
      ? new FreeRegistration()
      : registration.getFreeRegistration();
    freeRegistration.setRegistration(registration);
    freeRegistration.setSource(source);
    if (source == FreeRegistrationSource.USER) {
      freeRegistration.setIsForeignEducation("abroad".equals(basis.countryOfEducation()));
      FreeRegistrationType educationType = basis.educationType();
      freeRegistration.setType(educationType);
      // Choices available in UI are matriculation examination, higher education degree and higher education studies
      freeRegistration.setMatriculationExam(educationType == FreeRegistrationType.MatriculationExam);
      freeRegistration.setHigherEducationConcluded(educationType == FreeRegistrationType.HigherEducationConcluded);
      freeRegistration.setHigherEducationEnrolled(educationType == FreeRegistrationType.HigherEducationEnrolled);
      freeRegistration.setDia(false);
      freeRegistration.setEb(false);
      freeRegistration.setOther(false);
    } else {
      final List<PublicEducationDTO> educationDTOs = koskiService.getEducations(registration.getPerson().getOid());

      final Set<FreeRegistrationType> freeEnrollmentTypes = educationDTOs
        .stream()
        .map(FreeRegistrationType::fromEducationDTO)
        .collect(Collectors.toSet());

      if (freeEnrollmentTypes.isEmpty()) {
        throw new APIException(APIExceptionType.KOSKI_EDUCATIONS_NOT_FOUND);
      }

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
      freeRegistration.setType(getFreeRegistrationType(freeRegistration));
      freeRegistration.setIsForeignEducation(false);
    }
    freeRegistrationRepository.saveAndFlush(freeRegistration);

    return PublicFreeRegistrationDTO.builder().id(freeRegistration.getId()).build();
  }

  @Transactional(readOnly = true)
  public int getUsedFreeRegistrations(String oid) {
    return freeRegistrationRepository.countFreeRegistrationsUsed(oid);
  }

  @Transactional(readOnly = true)
  public boolean hasFreeRegistrationsLeft(String oid) {
    return freeRegistrationRepository.countFreeRegistrationsUsed(oid) < 3;
  }
}
