package fi.oph.yki;

import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Quarantine;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.model.type.FreeRegistrationType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import java.time.LocalDate;
import java.util.List;

public class Factory {

  public static Person person() {
    final Person person = new Person();
    person.setOid("1.2.3.4.5");
    person.setFirstName("Testi");
    person.setLastName("Henkilö");

    return person;
  }

  public static Registration registration(final Person person) {
    final Registration registration = new Registration();
    registration.setPerson(person);
    registration.setState(RegistrationState.SUBMITTED);
    registration.setKind(RegistrationKind.ADMISSION);
    registration.setPartialExamType(PartialExamType.ALL_PARTS);

    return registration;
  }

  public static FreeRegistration freeRegistration(final Registration registration) {
    final FreeRegistration freeRegistration = new FreeRegistration();
    freeRegistration.setRegistration(registration);
    freeRegistration.setType(FreeRegistrationType.MatriculationExam);
    freeRegistration.setSource(FreeRegistrationSource.KOSKI);
    freeRegistration.setIsForeignEducation(false);
    freeRegistration.setEb(false);
    freeRegistration.setDia(false);
    freeRegistration.setMatriculationExam(true);
    freeRegistration.setOther(false);
    freeRegistration.setHigherEducationConcluded(false);
    freeRegistration.setHigherEducationEnrolled(false);

    return freeRegistration;
  }

  public static ExamDate examDate() {
    final ExamDate examDate = new ExamDate();
    examDate.setExamDate(LocalDate.of(2026, 6, 15));
    examDate.setRegistrationStartDate(LocalDate.of(2026, 3, 1));
    examDate.setRegistrationEndDate(LocalDate.of(2026, 5, 31));
    examDate.setExamType(ExamSessionType.FULL);

    return examDate;
  }

  public static ExamSession examSession(final ExamDate examDate) {
    final ExamSession examSession = new ExamSession();
    examSession.setType(ExamSessionType.FULL);
    examSession.setExamDate(examDate);
    examSession.setLanguage("fin");
    examSession.setLevel("PERUS");
    examSession.setMaxParticipants(20);
    examSession.setContactName("Testi Henkilö");
    examSession.setContactEmail("testi@example.com");
    examSession.setContactPhoneNumber("0401234567");

    return examSession;
  }

  public static Quarantine quarantine() {
    final Quarantine quarantine = new Quarantine();
    quarantine.setLanguageCode("fin");
    quarantine.setBirthdate("1975-01-01");
    quarantine.setFirstName("Testi");
    quarantine.setLastName("Henkilö");
    quarantine.setStartDate(LocalDate.of(2026, 1, 1));
    quarantine.setEndDate(LocalDate.of(2026, 12, 31));

    return quarantine;
  }

  public static ExamSessionLocation examSessionLocation(final ExamSession examSession) {
    final ExamSessionLocation location = new ExamSessionLocation();
    location.setExamSession(examSession);
    location.setName("Testipaikka");
    location.setStreetAddress("Testikatu 1");
    location.setZip("00100");
    location.setPostOffice("Helsinki");
    location.setLang("fi");

    return location;
  }
}
