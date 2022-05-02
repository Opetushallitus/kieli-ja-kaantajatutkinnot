package fi.oph.otr.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.otr.api.dto.clerk.ClerkInterpreterDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkInterpreterUpdateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.ClerkLegalInterpreterUpdateDTO;
import fi.oph.otr.service.ClerkInterpreterService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
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
  private static final String TAG_LEGAL_INTERPRETER = "Legal interpreter API";

  @Resource
  private ClerkInterpreterService clerkInterpreterService;

  @GetMapping
  @Operation(tags = TAG_INTERPRETER, summary = "List all interpreters")
  public List<ClerkInterpreterDTO> listInterpreters() {
    return clerkInterpreterService.listInterpreters();
  }

  @Operation(tags = TAG_INTERPRETER, summary = "Create new interpreter")
  @PostMapping(consumes = APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ClerkInterpreterDTO createInterpreter(@RequestBody @Valid final ClerkInterpreterCreateDTO dto) {
    return clerkInterpreterService.create(dto);
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

  @Operation(tags = TAG_LEGAL_INTERPRETER, summary = "Create new legal interpreter")
  @PostMapping(path = "/{interpreterId:\\d+}/legalinterpreter", consumes = APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ClerkInterpreterDTO createLegalInterpreter(
    @PathVariable final long interpreterId,
    @RequestBody @Valid final ClerkLegalInterpreterCreateDTO dto
  ) {
    return clerkInterpreterService.createLegalInterpreter(interpreterId, dto);
  }

  @Operation(tags = TAG_LEGAL_INTERPRETER, summary = "Update legal interpreter")
  @PutMapping(path = "/legalinterpreter", consumes = APPLICATION_JSON_VALUE)
  public ClerkInterpreterDTO updateLegalInterpreter(@RequestBody @Valid final ClerkLegalInterpreterUpdateDTO dto) {
    return clerkInterpreterService.updateLegalInterpreter(dto);
  }

  @Operation(tags = TAG_LEGAL_INTERPRETER, summary = "Delete legal interpreter")
  @DeleteMapping(path = "/legalinterpreter/{legalInterpreterId:\\d+}")
  public ClerkInterpreterDTO deleteLegalInterpreter(@PathVariable final long legalInterpreterId) {
    return clerkInterpreterService.deleteLegalInterpreter(legalInterpreterId);
  }
}
