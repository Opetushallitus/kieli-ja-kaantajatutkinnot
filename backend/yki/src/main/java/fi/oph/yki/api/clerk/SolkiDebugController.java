package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.solki.SolkiDebugService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Java port of yki_register_debug.clj and the /solki/connection endpoint in debug.clj - manual
 * ops tools, hidden from the API docs like Clojure's ":no-doc true", admin-only via the
 * existing /v2/api/clerk/** security matcher.
 */
@Hidden
@RestController
@RequestMapping(value = "/v2/api/clerk/solki-debug", produces = APPLICATION_JSON_VALUE)
public class SolkiDebugController {

  private static final String TAG_SOLKI_DEBUG = "SOLKI debug API";

  @Resource
  private SolkiDebugService solkiDebugService;

  @GetMapping("/connection")
  @Operation(tags = TAG_SOLKI_DEBUG, summary = "Check SOLKI reachability")
  public Map<String, Integer> checkConnection() {
    return Map.of("status", solkiDebugService.checkConnection());
  }

  @GetMapping(path = "/{examSessionId}", produces = "text/csv")
  @Operation(tags = TAG_SOLKI_DEBUG, summary = "Export the participants CSV for an exam session without sending it")
  public String exportParticipantsCsv(@PathVariable final long examSessionId) {
    return solkiDebugService.exportParticipantsCsv(examSessionId);
  }

  @PostMapping("/sync/exam-session/{examSessionId}")
  @Operation(
    tags = TAG_SOLKI_DEBUG,
    summary = "Manually force organizer + exam session sync, bypassing the enabled flag"
  )
  public Map<String, Boolean> forceSyncExamSession(@PathVariable final long examSessionId) {
    solkiDebugService.forceSyncExamSession(examSessionId);
    return Map.of("success", true);
  }

  @PostMapping("/sync/exam-session/{examSessionId}/participants")
  @Operation(tags = TAG_SOLKI_DEBUG, summary = "Manually force a participants CSV sync, bypassing the enabled flag")
  public Map<String, Boolean> forceSyncParticipants(@PathVariable final long examSessionId) {
    solkiDebugService.forceSyncParticipants(examSessionId);
    return Map.of("success", true);
  }
}
