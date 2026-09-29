package fi.oph.yki;

import fi.oph.yki.model.Email;
import fi.oph.yki.model.EmailType;
import fi.oph.yki.model.Evaluation;
import fi.oph.yki.model.EvaluationOrder;
import fi.oph.yki.model.EvaluationOrderSubtest;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamDateLanguage;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.ExamSessionStatistics;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Quarantine;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.RegistrationChangeEvent;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.model.type.FreeRegistrationType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.model.type.Subtest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class Factory {

  public static final LocalDateTime DEFAULT_REGISTRATION_CREATED_AT = LocalDateTime.of(2026, 4, 1, 10, 0);

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
    // `created` is mapped as an insertable column, so leaving it unset makes Hibernate write NULL
    // over the database default. Postgres sorts NULLs last under ORDER BY created ASC, which would
    // make any FIFO-ordering assertion silently depend on insertion order instead.
    registration.setCreatedAt(DEFAULT_REGISTRATION_CREATED_AT);

    return registration;
  }

  /**
   * A registration waiting in an exam session's queue, in the state the queue-lifting job looks
   * for: {@code kind=QUEUE}, {@code state=SUBMITTED}.
   *
   * <p>Note that {@code participant_limit_trigger} rejects the first queued registration in a
   * session whose relevant pool still has room ("registration to queue is not available"), so a
   * fixture using this must fill that pool with ADMISSION registrations first.
   *
   * <p>Callers that assert on FIFO order must set distinct {@code createdAt} values; every
   * registration from this factory shares one timestamp.
   */
  public static Registration queuedRegistration(final Person person, final PartialExamType partialExamType) {
    final Registration registration = registration(person);
    registration.setKind(RegistrationKind.QUEUE);
    registration.setState(RegistrationState.SUBMITTED);
    registration.setPartialExamType(partialExamType);
    registration.setUiLanguage("fi");
    registration.setStrongAuth(true);

    return registration;
  }

  public static Participant participant(final String email) {
    final Participant participant = new Participant();
    participant.setExternalUserId(email);
    participant.setEmail(email);

    return participant;
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

  public static ExamDateLanguage examDateLanguage(final ExamDate examDate) {
    final ExamDateLanguage examDateLanguage = new ExamDateLanguage();
    examDateLanguage.setExamDate(examDate);
    examDateLanguage.setLanguageCode("fin");
    examDateLanguage.setLevelCode("PERUS");

    return examDateLanguage;
  }

  public static Evaluation evaluation(final ExamDate examDate, final ExamDateLanguage examDateLanguage) {
    final Evaluation evaluation = new Evaluation();
    evaluation.setExamDate(examDate);
    evaluation.setExamDateLanguage(examDateLanguage);
    evaluation.setEvaluationStartDate(LocalDate.now().minusDays(10));
    evaluation.setEvaluationEndDate(LocalDate.now().plusDays(10));

    return evaluation;
  }

  public static EvaluationOrder evaluationOrder(final Evaluation evaluation) {
    final EvaluationOrder evaluationOrder = new EvaluationOrder();
    evaluationOrder.setEvaluation(evaluation);

    return evaluationOrder;
  }

  public static EvaluationOrderSubtest evaluationOrderSubtest(
    final EvaluationOrder evaluationOrder,
    final Subtest subtest
  ) {
    final EvaluationOrderSubtest evaluationOrderSubtest = new EvaluationOrderSubtest();
    evaluationOrderSubtest.setEvaluationOrder(evaluationOrder);
    evaluationOrderSubtest.setSubtest(subtest);

    return evaluationOrderSubtest;
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

  public static Organizer organizer() {
    final Organizer organizer = new Organizer();
    organizer.setOid("1.2.246.562.10.00000000001");
    organizer.setAgreementStartDate(LocalDate.of(2024, 1, 1));
    organizer.setAgreementEndDate(LocalDate.of(2025, 12, 31));
    organizer.setContactName("Testi Järjestäjä");
    organizer.setContactEmail("jarjestaja@example.com");
    organizer.setContactPhoneNumber("0401234567");

    return organizer;
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

  public static ExamSessionStatistics examSessionStatistics(final ExamSession examSession) {
    final ExamSessionStatistics statistics = new ExamSessionStatistics();
    statistics.setExamSession(examSession);
    statistics.setParticipants(0);
    statistics.setQueue(0);
    statistics.setMaxParticipantCount(0);
    statistics.setMaxQueueCount(0);
    statistics.setMaxParticipantsAt(LocalDateTime.of(2026, 1, 1, 0, 0));
    statistics.setMaxQueueAt(LocalDateTime.of(2026, 1, 1, 0, 0));

    return statistics;
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

  public static ExamSessionLocation examSessionLocation(final ExamSession examSession, final String lang) {
    final ExamSessionLocation location = examSessionLocation(examSession);
    location.setLang(lang);
    location.setName("Testipaikka " + lang);
    location.setExtraInformation("Lisätietoa " + lang);

    return location;
  }

  /**
   * Locations in all three supported languages, so that locale resolution in emails has something
   * to choose between. Real sessions normally have all three, but not always.
   */
  public static List<ExamSessionLocation> examSessionLocations(final ExamSession examSession) {
    return List.of(
      examSessionLocation(examSession, "fi"),
      examSessionLocation(examSession, "sv"),
      examSessionLocation(examSession, "en")
    );
  }

  /**
   * The change event the queue-lifting job writes. Kind and state are read off the registration,
   * so it must already carry its post-lift values: the legacy statistics fold treats a
   * LIFT_FROM_QUEUE event with kind ADMISSION as "one moved from queue to participants", and one
   * with kind QUEUE as "one left the queue" and nothing more.
   */
  public static RegistrationChangeEvent registrationChangeEvent(final Registration registration) {
    final RegistrationChangeEvent changeEvent = new RegistrationChangeEvent();
    changeEvent.setEvent("LIFT_FROM_QUEUE");
    changeEvent.setRegistrationId(registration.getId());
    changeEvent.setExamSessionId(registration.getExamSession().getId());
    changeEvent.setRegistrationKind(registration.getKind());
    changeEvent.setRegistrationState(registration.getState());
    changeEvent.setCreatedAt(LocalDateTime.now());
    changeEvent.setAuthorType("AUTOMATION");

    return changeEvent;
  }

  public static Email email() {
    final Email email = new Email();
    email.setEmailType(EmailType.LOGIN);
    email.setRecipientName("Testi Henkilö");
    email.setRecipientAddress("testi.henkilo@invalid");
    email.setSubject("Otsikko");
    email.setBody("Sisältö on tässä");

    return email;
  }
}
