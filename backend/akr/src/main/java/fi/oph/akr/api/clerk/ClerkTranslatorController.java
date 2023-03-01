package fi.oph.akr.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.akr.api.dto.clerk.ClerkTranslatorDTO;
import fi.oph.akr.api.dto.clerk.ClerkTranslatorResponseDTO;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationCreateDTO;
import fi.oph.akr.api.dto.clerk.modify.AuthorisationUpdateDTO;
import fi.oph.akr.api.dto.clerk.modify.TranslatorCreateDTO;
import fi.oph.akr.api.dto.clerk.modify.TranslatorUpdateDTO;
import fi.oph.akr.service.ClerkTranslatorService;
import io.swagger.v3.oas.annotations.Operation;
import javax.annotation.Resource;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/clerk/translator", produces = APPLICATION_JSON_VALUE)
public class ClerkTranslatorController {

  private static final String TAG_TRANSLATOR = "Translator API";
  private static final String TAG_AUTHORISATION = "Authorisation API";

  @Resource
  private ClerkTranslatorService clerkTranslatorService;

  // TRANSLATOR

  @GetMapping
  @Operation(
    tags = TAG_TRANSLATOR,
    operationId = "list_translator",
    summary = "List all translators, with all their data"
  )
  public ClerkTranslatorResponseDTO listTranslators() {
    return clerkTranslatorService.listTranslators();
  }

  @Operation(
    tags = TAG_TRANSLATOR,
    summary = "Create new translator with authorisations",
    description = "Creates new translator with all its data. Returns all translator data, as it is returned in @list_translator"
  )
  @PostMapping(consumes = APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ClerkTranslatorDTO createTranslator(@RequestBody @Valid final TranslatorCreateDTO dto) {
    return clerkTranslatorService.createTranslator(dto);
  }

  @Operation(tags = TAG_TRANSLATOR, summary = "Get single translator with all its data")
  @GetMapping(path = "/{translatorId:\\d+}")
  public ClerkTranslatorDTO getTranslator(@PathVariable final long translatorId) {
    return clerkTranslatorService.getTranslator(translatorId);
  }

  @Operation(tags = TAG_TRANSLATOR, summary = "Update translator personal data")
  @PutMapping(consumes = APPLICATION_JSON_VALUE)
  public ClerkTranslatorDTO updateTranslator(@RequestBody @Valid final TranslatorUpdateDTO dto) {
    return clerkTranslatorService.updateTranslator(dto);
  }

  @Operation(tags = TAG_TRANSLATOR, summary = "Delete translator")
  @DeleteMapping(path = "/{translatorId:\\d+}")
  public void deleteTranslator(@PathVariable final long translatorId) {
    clerkTranslatorService.deleteTranslator(translatorId);
  }

  // AUTHORISATION

  @Operation(tags = TAG_AUTHORISATION, summary = "Create authorisation")
  @PostMapping(path = "/{translatorId:\\d+}/authorisation", consumes = APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ClerkTranslatorDTO createAuthorisation(
    @PathVariable final long translatorId,
    @RequestBody @Valid final AuthorisationCreateDTO dto
  ) {
    return clerkTranslatorService.createAuthorisation(translatorId, dto);
  }

  @Operation(tags = TAG_AUTHORISATION, summary = "Update authorisation")
  @PutMapping(path = "/authorisation", consumes = APPLICATION_JSON_VALUE)
  public ClerkTranslatorDTO updateAuthorisation(@RequestBody @Valid final AuthorisationUpdateDTO dto) {
    return clerkTranslatorService.updateAuthorisation(dto);
  }

  @Operation(tags = TAG_AUTHORISATION, summary = "Delete authorisation")
  @DeleteMapping(path = "/authorisation/{authorisationId:\\d+}")
  public ClerkTranslatorDTO deleteAuthorisation(@PathVariable final long authorisationId) {
    return clerkTranslatorService.deleteAuthorisation(authorisationId);
  }
}
