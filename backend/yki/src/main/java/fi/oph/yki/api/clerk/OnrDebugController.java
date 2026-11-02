package fi.oph.yki.api.clerk;

import fi.oph.yki.onr.OnrDebugService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Hidden
@RestController
@RequestMapping(value = "/v2/api/clerk/onr-debug")
public class OnrDebugController {

  private static final String TAG_ONR_DEBUG = "ONR debug API";

  @Resource
  private OnrDebugService onrDebugService;

  @GetMapping(path = "/participants", produces = "text/csv")
  @Operation(tags = TAG_ONR_DEBUG, summary = "Export the CSV of participants that ONR has not individualised")
  public String exportNotIndividualisedParticipantsCsv() {
    return onrDebugService.exportNotIndividualisedParticipantsCsv();
  }
}
