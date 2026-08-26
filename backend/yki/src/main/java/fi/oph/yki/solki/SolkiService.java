package fi.oph.yki.solki;

import com.fasterxml.jackson.databind.node.ObjectNode;
import fi.oph.yki.koodisto.KoodistoService;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.GenderCode;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.OrganizationService;
import fi.oph.yki.service.dto.OrganizationDetailsDTO;
import fi.oph.yki.solki.dto.ExamDateSyncRequestDTO;
import fi.oph.yki.solki.dto.ExamSessionSyncRequestDTO;
import fi.oph.yki.solki.dto.OrganizerSyncRequestDTO;
import fi.oph.yki.solki.dto.PersonSyncRequestDTO;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

/**
 * HTTP client + payload logic for SOLKI (the national YKI exam register, hosted at
 * yki.jyu.fi). Ported from the legacy Clojure integration in
 * yki/src/yki/boundary/yki_register.clj - field names below are Finnish because
 * they are SOLKI's external API contract, not our domain vocabulary
 */
@Service
@RequiredArgsConstructor
public class SolkiService {

  private static final Logger LOG = LoggerFactory.getLogger(SolkiService.class);
  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

  private static final Map<String, String> LEVEL_CONVERSION = Map.of("PERUS", "PT", "KESKI", "KT", "YLIN", "YT");

  // HOTFIX (ported as-is): if nationality/country is null, empty, or one of these codes,
  // SOLKI and our koodisto codes disagree on the mapping, so we send "xxx" rather than a
  // wrong value. See the equivalent comment in yki_register.clj for the "find out why" TODO.
  private static final Set<String> UNSUPPORTED_OR_MISSING_CODES = Set.of("ZAR", "YYY", "XKK", "");
  private static final String MISSING_CODE_FALLBACK = "xxx";

  private final WebClient solkiClient;
  private final OrganizationService organizationService;
  private final KoodistoService koodistoService;
  private final RegistrationRepository registrationRepository;
  private final OnrService onrService;

  @Value("${app.solki.exam-session-sync-enabled}")
  private boolean examSessionSyncEnabled;

  @Value("${app.solki.person-sync-enabled}")
  private boolean personSyncEnabled;

  // ---------------------------------------------------------------------
  // Pure payload/domain logic - kept static and side-effect free for testability.
  // ---------------------------------------------------------------------

  static String convertLevel(final String level) {
    final String converted = LEVEL_CONVERSION.get(level);
    if (converted == null) {
      throw new IllegalArgumentException("Unknown exam level for SOLKI sync: " + level);
    }
    return converted;
  }

  static String applyMissingCodeFallback(final String code) {
    if (code == null || UNSUPPORTED_OR_MISSING_CODES.contains(code)) {
      return MISSING_CODE_FALLBACK;
    }
    return code;
  }

  public static GenderCode convertGender(final String gender, final String ssn) {
    if (ssn != null && !ssn.isBlank()) {
      final int individualNumber = Integer.parseInt(ssn.substring(7, 10));
      return individualNumber % 2 == 1 ? GenderCode.M : GenderCode.N;
    }
    if ("1".equals(gender)) {
      return GenderCode.M;
    }
    if ("2".equals(gender)) {
      return GenderCode.N;
    }
    return GenderCode.E;
  }

  /**
   * Finnish personal identity code if present, otherwise a SOLKI-specific pseudo-identifier
   * derived from the birthdate: ddMMyy followed by a century marker ('-' for 1900s, 'A' for
   * 2000s+, matching the two cases the legacy integration handles).
   */
  static String ssnOrBirthdate(final String ssn, final String birthdate) {
    if (ssn != null && !ssn.isBlank()) {
      return ssn;
    }

    final String[] parts = birthdate.split("-");
    final String year = parts[0];
    final String month = parts[1];
    final String day = parts[2];
    final String centuryMarker = Integer.parseInt(year) < 2000 ? "-" : "A";

    return day + month + year.substring(2, 4) + centuryMarker;
  }

  record SubtestFlags(int speak, int write, int listen, int read) {
    static final SubtestFlags NONE = new SubtestFlags(0, 0, 0, 0);

    SubtestFlags mergeWith(final SubtestFlags other) {
      return new SubtestFlags(
        Math.max(speak, other.speak),
        Math.max(write, other.write),
        Math.max(listen, other.listen),
        Math.max(read, other.read)
      );
    }
  }

  static SubtestFlags sessionTypeToSubtestFlags(
    final ExamSessionType sessionType,
    final PartialExamType partialExamType
  ) {
    final PartialExamType part = partialExamType != null ? partialExamType : PartialExamType.ALL_PARTS;
    final ExamSessionType type = sessionType != null ? sessionType : ExamSessionType.FULL;

    return switch (type) {
      case READ_SPEAK -> new SubtestFlags(
        isPart(part, PartialExamType.SPEAK) ? 1 : 0,
        0,
        0,
        isPart(part, PartialExamType.READ) ? 1 : 0
      );
      case LISTEN_WRITE -> new SubtestFlags(
        0,
        isPart(part, PartialExamType.WRITE) ? 1 : 0,
        isPart(part, PartialExamType.LISTEN) ? 1 : 0,
        0
      );
      case FULL -> new SubtestFlags(
        isPart(part, PartialExamType.SPEAK) ? 1 : 0,
        isPart(part, PartialExamType.WRITE) ? 1 : 0,
        isPart(part, PartialExamType.LISTEN) ? 1 : 0,
        isPart(part, PartialExamType.READ) ? 1 : 0
      );
    };
  }

  private static boolean isPart(final PartialExamType part, final PartialExamType candidate) {
    return part == PartialExamType.ALL_PARTS || part == candidate;
  }

  /**
   * Combines subtest flags across a person's registrations within the same exam session
   * (a "FULL" session can be registered into via separate read+listen / speak+write pools,
   * each becoming its own registration row for the same person and exam_session_id) into
   * the single flag set SOLKI expects per participant.
   */
  static SubtestFlags mergeFlags(final List<SubtestFlags> flagsList) {
    return flagsList.stream().reduce(SubtestFlags.NONE, SubtestFlags::mergeWith);
  }

  // ---------------------------------------------------------------------
  // Request payload builders
  // ---------------------------------------------------------------------

  OrganizerSyncRequestDTO buildOrganizerSyncRequest(final Organizer organizer, final OrganizationDetailsDTO org) {
    final List<OrganizerSyncRequestDTO.ExamOfferingDTO> examOfferings = organizer
      .getLanguages()
      .stream()
      .map(l -> new OrganizerSyncRequestDTO.ExamOfferingDTO(l.getLanguageCode(), convertLevel(l.getLevelCode())))
      .toList();

    return new OrganizerSyncRequestDTO(
      organizer.getOid(),
      org.name(),
      org.streetAddress(),
      org.postalCode(),
      organizer.getContactPhoneNumber(),
      org.postOffice(),
      organizer.getContactName(),
      organizer.getContactEmail(),
      org.website(),
      examOfferings
    );
  }

  ExamSessionSyncRequestDTO buildExamSessionSyncRequest(final ExamSession examSession) {
    final String organizerOid = examSession.getOfficeOid() != null
      ? examSession.getOfficeOid()
      : examSession.getOrganizer().getOid();

    return new ExamSessionSyncRequestDTO(
      examSession.getLanguage(),
      convertLevel(examSession.getLevel()),
      DATE_FORMAT.format(examSession.getExamDate().getExamDate()),
      organizerOid
    );
  }

  ExamDateSyncRequestDTO buildExamDateSyncRequest(final ExamSession examSession) {
    return new ExamDateSyncRequestDTO(
      examSession.getLanguage(),
      DATE_FORMAT.format(examSession.getExamDate().getExamDate())
    );
  }

  PersonSyncRequestDTO buildPersonSyncRequest(final Person person) {
    final String nationalityCode = applyMissingCodeFallback(
      koodistoService.getConvertedCountryCode(person.getNationalityCode())
    );
    final String countryCode = applyMissingCodeFallback(
      koodistoService.getConvertedCountryCode(person.getCountryCode())
    );

    return new PersonSyncRequestDTO(
      person.getLastName(),
      person.getFirstName(),
      person.getGender() != null ? person.getGender().name() : null,
      nationalityCode,
      countryCode,
      person.getSteetAddress(),
      person.getZip(),
      person.getPostOffice(),
      person.getEmail()
    );
  }

  // ---------------------------------------------------------------------
  // Participants CSV
  // ---------------------------------------------------------------------

  private static final CSVFormat SOLKI_CSV_FORMAT = CSVFormat.DEFAULT.builder().setDelimiter(';').get();

  String buildParticipantsCsv(
    final ExamSessionType examSessionType,
    final List<Registration> registrations,
    final Map<String, String> oidToSsn
  ) {
    final Map<String, List<Registration>> byPersonOid = registrations
      .stream()
      .collect(Collectors.groupingBy(r -> r.getPerson().getOid(), LinkedHashMap::new, Collectors.toList()));

    try (StringWriter writer = new StringWriter(); CSVPrinter printer = new CSVPrinter(writer, SOLKI_CSV_FORMAT)) {
      for (final List<Registration> personRegistrations : byPersonOid.values()) {
        printer.printRecord(toCsvRow(examSessionType, personRegistrations, oidToSsn));
      }
      printer.flush();
      return writer.toString();
    } catch (final IOException e) {
      throw new RuntimeException("Could not build SOLKI participants CSV", e);
    }
  }

  private List<String> toCsvRow(
    final ExamSessionType examSessionType,
    final List<Registration> personRegistrations,
    final Map<String, String> oidToSsn
  ) {
    final Registration first = personRegistrations.get(0);
    final Person person = first.getPerson();
    final ObjectNode form = first.getForm();

    final SubtestFlags flags = mergeFlags(
      personRegistrations.stream().map(r -> sessionTypeToSubtestFlags(examSessionType, r.getPartialExamType())).toList()
    );
    final boolean isTransferred = personRegistrations.stream().anyMatch(r -> Boolean.TRUE.equals(r.getIsTransfered()));

    final String ssn = oidToSsn.get(person.getOid());
    final String nationality = applyMissingCodeFallback(
      koodistoService.getConvertedCountryCode(firstNationality(form))
    );
    final String country = applyMissingCodeFallback(koodistoService.getConvertedCountryCode(person.getCountryCode()));

    return List.of(
      person.getOid(),
      ssnOrBirthdate(ssn, getFormField(form, "birthdate")),
      nullToEmpty(person.getLastName()),
      nullToEmpty(person.getFirstName()),
      convertGender(getFormField(form, "gender"), ssn).name(),
      nationality,
      nullToEmpty(person.getSteetAddress()),
      nullToEmpty(person.getZip()),
      nullToEmpty(person.getPostOffice()),
      country,
      nullToEmpty(person.getEmail()),
      nullToEmpty(getFormField(form, "exam_lang")),
      nullToEmpty(getFormField(form, "certificate_lang")),
      isTransferred ? "1" : "0",
      String.valueOf(flags.speak()),
      String.valueOf(flags.write()),
      String.valueOf(flags.read()),
      String.valueOf(flags.listen())
    );
  }

  private static String firstNationality(final ObjectNode form) {
    if (form == null || !form.has("nationalities") || !form.get("nationalities").isArray()) {
      return null;
    }
    final var nationalities = form.get("nationalities");
    return !nationalities.isEmpty() ? nationalities.get(0).asText() : null;
  }

  private static String getFormField(final ObjectNode form, final String field) {
    if (form == null || !form.has(field) || form.get(field).isNull()) {
      return null;
    }
    return form.get(field).asText();
  }

  private static String nullToEmpty(final String value) {
    return value != null ? value : "";
  }

  public void syncExamSessionParticipants(final ExamSession examSession) {
    syncExamSessionParticipants(examSession, false);
  }

  /** Bypasses the person-sync-enabled flag - only for the manual debug/force-sync endpoint. */
  public void forceSyncExamSessionParticipants(final ExamSession examSession) {
    syncExamSessionParticipants(examSession, true);
  }

  private void syncExamSessionParticipants(final ExamSession examSession, final boolean force) {
    final String csv = buildParticipantsCsv(examSession);

    if (!force && !personSyncEnabled) {
      LOG.info(
        "SOLKI participant sync disabled, would have sent CSV for exam session {}:\n{}",
        examSession.getId(),
        csv
      );
      return;
    }

    postParticipantsCsv(examSession, csv);
  }

  /** Fetches completed registrations and builds the CSV without sending it - used by the debug CSV export endpoint. */
  public String buildParticipantsCsv(final ExamSession examSession) {
    final List<Registration> registrations = registrationRepository.getByExamSessionAndState(
      examSession,
      RegistrationState.COMPLETED
    );
    final Map<String, String> oidToSsn = getIdentityNumbersByOid(registrations);
    return buildParticipantsCsv(examSession.getType(), registrations, oidToSsn);
  }

  public int checkConnection() {
    return solkiClient.get().uri("/").exchangeToMono(response -> Mono.just(response.statusCode().value())).block();
  }

  private Map<String, String> getIdentityNumbersByOid(final List<Registration> registrations) {
    final List<String> oids = registrations.stream().map(r -> r.getPerson().getOid()).distinct().toList();

    if (oids.isEmpty()) {
      return Map.of();
    }

    try {
      return onrService
        .listPersonDetails(oids)
        .stream()
        .filter(p -> p.getIdentityNumber() != null)
        .collect(Collectors.toMap(PersonalDataDTO::getOidHenkilo, PersonalDataDTO::getIdentityNumber));
    } catch (final Exception e) {
      LOG.error("Unable to fetch identity numbers from ONR for SOLKI participant sync", e);
      return Map.of();
    }
  }

  private String buildQueryParams(
    final String languageCode,
    final String level,
    final String examDate,
    final String organizerOid
  ) {
    return (
      "?kieli=" +
      urlEncode(languageCode) +
      "&taso=" +
      urlEncode(convertLevel(level)) +
      "&pvm=" +
      urlEncode(examDate) +
      "&jarjestaja=" +
      urlEncode(organizerOid)
    );
  }

  private static String urlEncode(final String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8);
  }

  public void syncOrganizer(final Organizer organizer, final String officeOid) {
    syncOrganizer(organizer, officeOid, false);
  }

  public void forceSyncOrganizer(final Organizer organizer, final String officeOid) {
    syncOrganizer(organizer, officeOid, true);
  }

  private void syncOrganizer(final Organizer organizer, final String officeOid, final boolean force) {
    if (!force && !examSessionSyncEnabled) {
      LOG.info("SOLKI organizer sync disabled, would have synced organizer {}", organizer.getOid());
      return;
    }

    final OrganizationDetailsDTO orgDetails = organizationService.getOrganizationDetails(
      officeOid != null ? officeOid : organizer.getOid()
    );
    final OrganizerSyncRequestDTO request = buildOrganizerSyncRequest(organizer, orgDetails);

    post("/jarjestaja", request);
  }

  public void deleteOrganizer(final String organizerOid) {
    if (!examSessionSyncEnabled) {
      LOG.info("SOLKI organizer sync disabled, would have deleted organizer {}", organizerOid);
      return;
    }

    delete("/jarjestaja?oid=" + urlEncode(organizerOid));
  }

  public void syncExamSession(final ExamSession examSession) {
    syncExamSession(examSession, false);
  }

  /** Bypasses the exam-session-sync-enabled flag - only for the manual debug/force-sync endpoint. */
  public void forceSyncExamSession(final ExamSession examSession) {
    syncExamSession(examSession, true);
  }

  /** Convenience for the debug/force-sync endpoint, mirroring what the backstop scheduled task does per session. */
  public void forceSyncExamSessionAndOrganizer(final ExamSession examSession) {
    forceSyncOrganizer(examSession.getOrganizer(), examSession.getOfficeOid());
    forceSyncExamSession(examSession);
  }

  private void syncExamSession(final ExamSession examSession, final boolean force) {
    final ExamDateSyncRequestDTO examDateRequest = buildExamDateSyncRequest(examSession);
    final ExamSessionSyncRequestDTO examSessionRequest = buildExamSessionSyncRequest(examSession);

    if (!force && !examSessionSyncEnabled) {
      LOG.info("SOLKI exam session sync disabled, would have sent exam date request {}", examDateRequest);
      LOG.info("SOLKI exam session sync disabled, would have sent exam session request {}", examSessionRequest);
      return;
    }

    post("/tutkinto", examDateRequest);
    post("/tutkintotilaisuus", examSessionRequest);
  }

  public void deleteExamSession(final ExamSession examSession) {
    final String organizerOid = examSession.getOfficeOid() != null
      ? examSession.getOfficeOid()
      : examSession.getOrganizer().getOid();
    final String queryParams = buildQueryParams(
      examSession.getLanguage(),
      examSession.getLevel(),
      DATE_FORMAT.format(examSession.getExamDate().getExamDate()),
      organizerOid
    );

    if (!examSessionSyncEnabled) {
      LOG.info(
        "SOLKI exam session sync disabled, would have deleted exam session {} with params {}",
        examSession.getId(),
        queryParams
      );
      return;
    }

    delete("/tutkintotilaisuus" + queryParams);
  }

  public void syncPerson(final Person person) {
    final PersonSyncRequestDTO request = buildPersonSyncRequest(person);

    if (!personSyncEnabled) {
      LOG.info("SOLKI person sync disabled, would have sent request {}", request);
      return;
    }

    put("/osallistuja/" + urlEncode(person.getOid()), request);
  }

  private void postParticipantsCsv(final ExamSession examSession, final String csv) {
    final String organizerOid = examSession.getOfficeOid() != null
      ? examSession.getOfficeOid()
      : examSession.getOrganizer().getOid();
    final String queryParams = buildQueryParams(
      examSession.getLanguage(),
      examSession.getLevel(),
      DATE_FORMAT.format(examSession.getExamDate().getExamDate()),
      organizerOid
    );

    solkiClient
      .post()
      .uri("/osallistujat" + queryParams)
      .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
      .bodyValue(csv)
      .retrieve()
      .toBodilessEntity()
      .block();
  }

  private void post(final String uri, final Object body) {
    try {
      solkiClient.post().uri(uri).bodyValue(body).retrieve().toBodilessEntity().block();
    } catch (final Exception e) {
      LOG.error("SOLKI POST {} failed", uri, e);
      throw new RuntimeException("Could not sync request to SOLKI: " + uri, e);
    }
  }

  private void put(final String uri, final Object body) {
    try {
      solkiClient.put().uri(uri).bodyValue(body).retrieve().toBodilessEntity().block();
    } catch (final Exception e) {
      LOG.error("SOLKI PUT {} failed", uri, e);
      throw new RuntimeException("Could not sync request to SOLKI: " + uri, e);
    }
  }

  private void delete(final String uri) {
    try {
      solkiClient.delete().uri(uri).retrieve().toBodilessEntity().block();
    } catch (final WebClientResponseException e) {
      if (e.getStatusCode() == HttpStatusCode.valueOf(404)) {
        LOG.info("SOLKI DELETE {} returned 404, treating as already deleted", uri);
        return;
      }
      LOG.error("SOLKI DELETE {} failed", uri, e);
      throw new RuntimeException("Could not delete via SOLKI: " + uri, e);
    } catch (final Exception e) {
      LOG.error("SOLKI DELETE {} failed", uri, e);
      throw new RuntimeException("Could not delete via SOLKI: " + uri, e);
    }
  }
}
