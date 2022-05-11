package fi.oph.otr.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterUpdateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterUpdateDTO;
import fi.oph.otr.service.ClerkInterpreterService;
import fi.oph.otr.service.LanguageService;
import fi.oph.otr.service.RegionService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import java.util.Set;
import javax.annotation.Resource;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
@RequestMapping(value = "/api/v1/clerk/interpreter", produces = MediaType.APPLICATION_JSON_VALUE)
public class ClerkInterpreterController {

  private static final String TAG_INTERPRETER = "Interpreter API";
  private static final String TAG_QUALIFICATION = "Qualification API";

  @Resource
  private LanguageService languageService;

  @Resource
  private RegionService regionService;

  @Resource
  private ClerkInterpreterService clerkInterpreterService;

  @GetMapping(path = "/lang-codes")
  public Set<String> listKoodistoLangCodes() {
    return languageService.listKoodistoCodes();
  }

  @GetMapping(path = "/region-codes")
  public Set<String> listKoodistoRegionCodes() {
    return regionService.listKoodistoCodes();
  }

  // INTERPRETER

  @GetMapping
  @Operation(tags = TAG_INTERPRETER, summary = "List all interpreters")
  public List<ClerkInterpreterDTO> listInterpreters() {
    return clerkInterpreterService.list();
  }

  @Operation(tags = TAG_INTERPRETER, summary = "Create new interpreter")
  @PostMapping(consumes = APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ClerkInterpreterDTO createInterpreter(@RequestBody @Valid final ClerkInterpreterCreateDTO dto) {
    return clerkInterpreterService.createInterpreter(dto);
  }

  @Operation(tags = TAG_INTERPRETER, summary = "Get interpreter")
  @GetMapping(path = "/{interpreterId:\\d+}")
  public ClerkInterpreterDTO getInterpreter(@PathVariable final long interpreterId) {
    return clerkInterpreterService.getInterpreter(interpreterId);
  }

  @Operation(tags = TAG_INTERPRETER, summary = "Update interpreter")
  @PutMapping(consumes = APPLICATION_JSON_VALUE)
  public ClerkInterpreterDTO updateInterpreter(@RequestBody @Valid final ClerkInterpreterUpdateDTO dto) {
    return clerkInterpreterService.updateInterpreter(dto);
  }

  @Operation(tags = TAG_INTERPRETER, summary = "Delete interpreter")
  @DeleteMapping(path = "/{interpreterId:\\d+}")
  public ClerkInterpreterDTO deleteInterpreter(@PathVariable final long interpreterId) {
    return clerkInterpreterService.deleteInterpreter(interpreterId);
  }

  // QUALIFICATION

  @Operation(tags = TAG_QUALIFICATION, summary = "Create new qualification")
  @PostMapping(path = "/{interpreterId:\\d+}/qualification", consumes = APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ClerkInterpreterDTO createQualification(
    @PathVariable final long interpreterId,
    @RequestBody @Valid final ClerkLegalInterpreterCreateDTO dto
  ) {
    return clerkInterpreterService.createQualification(interpreterId, dto);
  }

  @Operation(tags = TAG_QUALIFICATION, summary = "Update qualification")
  @PutMapping(path = "/qualification", consumes = APPLICATION_JSON_VALUE)
  public ClerkInterpreterDTO updateQualification(@RequestBody @Valid final ClerkLegalInterpreterUpdateDTO dto) {
    return clerkInterpreterService.updateQualification(dto);
  }

  @Operation(tags = TAG_QUALIFICATION, summary = "Delete qualification")
  @DeleteMapping(path = "/qualification/{qualificationId:\\d+}")
  public ClerkInterpreterDTO deleteQualification(@PathVariable final long qualificationId) {
    return clerkInterpreterService.deleteQualification(qualificationId);
  }
}
