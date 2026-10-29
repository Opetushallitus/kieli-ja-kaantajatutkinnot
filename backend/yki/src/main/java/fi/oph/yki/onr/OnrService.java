package fi.oph.yki.onr;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import fi.oph.yki.api.dto.PublicRegistrationFormDTO;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.util.DateUtil;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.util.HttpConstants.Methods;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class OnrService {

  private static final Logger LOG = LoggerFactory.getLogger(OnrService.class);

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
    .registerModule(new JavaTimeModule())
    .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

  private static final int FIND_OR_CREATE_PERSON_ATTEMPTS = 3;

  private final CasClient casOnrClient;
  private final RequestBuilder defaultRequestBuilder;
  private final String onrServiceUrl;

  public OnrService(
    CasClient casOnrClient,
    @Qualifier("casRequestBuilder") RequestBuilder requestBuilder,
    @Value("${cas.onr-url}") String onrServiceUrl
  ) {
    this.casOnrClient = casOnrClient;
    this.defaultRequestBuilder = requestBuilder;
    this.onrServiceUrl = onrServiceUrl;
  }

  public PersonalDataDTO getPersonalData(final String oidNumber)
    throws RuntimeException, ExecutionException, InterruptedException, JsonProcessingException {
    final Request request = defaultRequestBuilder
      .setUrl(onrServiceUrl + "/henkilo/" + oidNumber)
      .setMethod(Methods.GET)
      .build();

    final Response response = casOnrClient.executeBlocking(request);
    if (response.getStatusCode() != HttpStatus.OK.value()) {
      throw new RuntimeException("Unexpected status code from ONR: " + response.getStatusCode());
    }

    final String json = response.getResponseBody();
    return OBJECT_MAPPER.readValue(json, new TypeReference<>() {});
  }

  public List<PersonalDataDTO> listPersonDetails(final List<String> oids)
    throws RuntimeException, ExecutionException, InterruptedException, JsonProcessingException {
    final String body = OBJECT_MAPPER.writeValueAsString(Map.of("henkiloOids", oids));
    final Request request = defaultRequestBuilder
      .setUrl(onrServiceUrl + "/s2s/henkilo/perustiedotAsAdmin")
      .setMethod(Methods.POST)
      .setBody(body)
      .build();

    final Response response = casOnrClient.executeBlocking(request);
    if (response.getStatusCode() != HttpStatus.OK.value()) {
      throw new RuntimeException("Unexpected status code from ONR: " + response.getStatusCode());
    }

    return OBJECT_MAPPER.readValue(response.getResponseBody(), new TypeReference<>() {});
  }

  public Optional<PersonalDataDTO> findPersonalDataByIdentityNumber(final String identityNumber)
    throws ExecutionException, InterruptedException, JsonProcessingException, RuntimeException {
    final Request request = defaultRequestBuilder
      .setUrl(onrServiceUrl + "/henkilo/hetu=" + identityNumber)
      .setMethod(Methods.GET)
      .build();

    final Response response = casOnrClient.executeBlocking(request);

    if (response.getStatusCode() == HttpStatus.OK.value()) {
      final PersonalDataDTO personalDataDTO = OBJECT_MAPPER.readValue(
        response.getResponseBody(),
        new TypeReference<>() {}
      );

      return Optional.of(personalDataDTO);
    } else if (response.getStatusCode() == HttpStatus.NOT_FOUND.value()) {
      return Optional.empty();
    } else {
      throw new RuntimeException(
        "ONR service called with GET /henkilo/hetu= returned unexpected status code: " + response.getStatusCode()
      );
    }
  }

  public Optional<String> findOrCreatePerson(final PublicRegistrationFormDTO form, final long registrationId)
    throws ExecutionException, InterruptedException, JsonProcessingException {
    final boolean hasSsn = StringUtils.hasText(form.ssn());
    PersonalDataDTO lastMismatch = null;

    // Port of get-or-create-person-with-retries in yki src/yki/boundary/onr.clj (https://github.com/Opetushallitus/yki,
    // https://github.com/Opetushallitus/yki/pull/165). The legacy loop/recur is this for loop: each attempt sends the
    // request again with the identifications findOrCreatePersonBody gives for that attempt.
    for (int attempt = 1; attempt <= FIND_OR_CREATE_PERSON_ATTEMPTS; attempt++) {
      final Request request = defaultRequestBuilder
        .setUrl(onrServiceUrl + "/s2s/findOrCreateHenkiloPerustieto")
        .setMethod(Methods.POST)
        .setBody(OBJECT_MAPPER.writeValueAsString(findOrCreatePersonBody(form, hasSsn, attempt)))
        .build();

      final Response response = casOnrClient.executeBlocking(request);
      final int status = response.getStatusCode();

      // New person created within ONR -> return response body
      if (status == HttpStatus.CREATED.value()) {
        final PersonalDataDTO person = OBJECT_MAPPER.readValue(response.getResponseBody(), new TypeReference<>() {});
        return Optional.ofNullable(person.getOidHenkilo());
      }

      // Found an existing person in ONR -> check and return details if they look like a reasonable match
      // Otherwise try again with slightly altered identification details to avoid using someone else's OID.
      if (status == HttpStatus.OK.value()) {
        final PersonalDataDTO person = OBJECT_MAPPER.readValue(response.getResponseBody(), new TypeReference<>() {});

        if (hasSsn) {
          if (!Objects.equals(form.lastName(), person.getLastName())) {
            LOG.warn(
              "Found ONR person by hetu, but last names differ. Registration id: {}, OID: {}",
              registrationId,
              person.getOidHenkilo()
            );
          }
          return Optional.ofNullable(person.getOidHenkilo());
        }

        if (Objects.equals(DateUtil.parseOptionalDate(form.birthdate()), person.getBirthdate())) {
          return Optional.ofNullable(person.getOidHenkilo());
        }

        LOG.warn(
          "Found ONR person, but birthdates differ. Registration id: {}, OID: {}, attempt: {}",
          registrationId,
          person.getOidHenkilo(),
          attempt
        );
        lastMismatch = person;
        continue;
      }

      // Else log error
      LOG.error("ONR findOrCreateHenkiloPerustieto returned status {} for registration id {}", status, registrationId);
      return Optional.empty();
    }

    LOG.error(
      "ONR attempts exhausted, returning the last mismatch. Registration id: {}, OID: {}",
      registrationId,
      lastMismatch.getOidHenkilo()
    );
    return Optional.ofNullable(lastMismatch.getOidHenkilo());
  }

  private static ObjectNode findOrCreatePersonBody(
    final PublicRegistrationFormDTO form,
    final boolean hasSsn,
    final int attempt
  ) {
    final String nickname = form.firstName().split(" ")[0];
    final ObjectNode node = OBJECT_MAPPER.createObjectNode();

    node
      .putArray("yhteystieto")
      .addObject()
      .put("yhteystietoTyyppi", "YHTEYSTIETO_SAHKOPOSTI")
      .put("yhteystietoArvo", form.email());
    node.put("etunimet", form.firstName());
    node.put("kutsumanimi", Objects.requireNonNullElse(form.preferredName(), nickname));
    node.put("sukunimi", form.lastName());
    node.put("sukupuoli", StringUtils.hasText(form.gender()) ? form.gender() : null);
    node.putObject("asiointiKieli").put("kieliKoodi", form.examLang());
    final ArrayNode nationalities = node.putArray("kansalaisuus");
    form.nationalities().forEach(code -> nationalities.addObject().put("kansalaisuusKoodi", code));
    node.put("henkiloTyyppi", "OPPIJA");
    if (form.nativeLanguage() != null) {
      node.putObject("aidinkieli").put("kieliKoodi", form.nativeLanguage().toLowerCase());
    }

    if (hasSsn) {
      node.put("hetu", form.ssn().toUpperCase());
      node.put("eiSuomalaistaHetua", false);
      return node;
    }

    node.put("syntymaaika", form.birthdate());
    node.put("eiSuomalaistaHetua", true);
    switch (attempt) {
      case 1 -> node
        .putArray("identifications")
        .addObject()
        .put("idpEntityId", "oppijaToken")
        .put("identifier", form.email());
      case 2 -> node
        .putArray("identifications")
        .addObject()
        .put("idpEntityId", "oppijaToken")
        .put(
          "identifier",
          String
            .join("_", form.lastName(), nickname, Objects.requireNonNullElse(form.birthdate(), ""))
            .replaceAll("\\s+", "")
            .toLowerCase()
        );
      // Without identifications, ONR creates a new person instead of matching an existing one.
      default -> node.putNull("identifications");
    }

    return node;
  }
}
